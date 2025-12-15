const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { isAuthenticated } = require('../middleware/auth');

// GET /api/wallet - Get balance and history
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });

        res.json({
            balance: user.walletBalance,
            transactions
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/wallet/add - Add money to wallet
router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const user = await User.findById(req.user.id);
        user.walletBalance += Number(amount);
        await user.save();

        const transaction = new Transaction({
            userId: req.user.id,
            amount: amount,
            type: 'credit',
            description: 'Added money to wallet'
        });
        await transaction.save();

        res.json({
            message: 'Money added successfully',
            balance: user.walletBalance,
            transaction
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});


// GET /api/wallet/cards - Get saved cards
router.get('/cards', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user.savedCards || []);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/wallet/cards - Add a new card
router.post('/cards', isAuthenticated, async (req, res) => {
    try {
        const { brand, last4, expMonth, expYear, cardHolder } = req.body;

        if (!brand || !last4 || !expMonth || !expYear || !cardHolder) {
            return res.status(400).json({ message: 'Please provide all card details' });
        }

        const user = await User.findById(req.user.id);

        // Simple duplicate check
        const exists = user.savedCards.some(c => c.last4 === last4 && c.brand === brand);
        if (exists) return res.status(400).json({ message: 'Card already saved' });

        user.savedCards.push({ brand, last4, expMonth, expYear, cardHolder });
        await user.save();

        res.json(user.savedCards);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE /api/wallet/cards/:id - Delete a card
router.delete('/cards/:id', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.savedCards.id(req.params.id)) {
            return res.status(404).json({ message: 'Card not found' });
        }

        user.savedCards.pull(req.params.id);
        await user.save();

        res.json(user.savedCards);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
