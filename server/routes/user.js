const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Address = require('../models/Address');
const bcrypt = require('bcryptjs');


// Middleware to verify token
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// ADMIN ROUTES

// GET /api/user/all - Get all users (Admin only)
router.get('/all', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/user/:id - Delete a user (Admin only)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        // Optional: Remove user's orders/cart? Keeping it simple for now.
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/user/create - Create a new user (Admin only)
router.post('/create', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all required fields' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            phone: phone || ''
        });

        await newUser.save();
        res.json({ message: 'User created successfully', user: newUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/user/addresses - Get all user addresses
router.get('/addresses', isAuthenticated, async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user.id });
        res.json(addresses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/user/addresses - Add a new address
router.post('/addresses', isAuthenticated, async (req, res) => {
    const { street, city, state, zip, country, isDefault, type } = req.body;
    try {
        const newAddress = new Address({
            userId: req.user.id,
            street,
            city,
            state,
            zip,
            country,
            isDefault,
            type
        });
        const savedAddress = await newAddress.save();

        // Update User model
        await User.findByIdAndUpdate(req.user.id, { $push: { addresses: savedAddress._id } });

        res.json(savedAddress);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/user/addresses/:id - Update an address
router.put('/addresses/:id', isAuthenticated, async (req, res) => {
    try {
        const updatedAddress = await Address.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { $set: req.body },
            { new: true }
        );
        if (!updatedAddress) return res.status(404).json({ message: 'Address not found' });
        res.json(updatedAddress);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/user/addresses/:id - Delete an address
router.delete('/addresses/:id', isAuthenticated, async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!address) return res.status(404).json({ message: 'Address not found' });

        // Remove from User model
        await User.findByIdAndUpdate(req.user.id, { $pull: { addresses: req.params.id } });

        res.json({ message: 'Address deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
