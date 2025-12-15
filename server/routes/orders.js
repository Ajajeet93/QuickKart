const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');

const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Middleware
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// POST /api/orders - Create a new order
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { items, totalAmount, shippingAddressId, paymentMethod } = req.body;

        if (paymentMethod === 'Wallet') {
            const user = await User.findById(req.user.id);
            if (user.walletBalance < totalAmount) {
                return res.status(400).json({ message: 'Insufficient wallet balance' });
            }
            user.walletBalance -= totalAmount;
            await user.save();
        }

        const newOrder = new Order({
            userId: req.user.id,
            items,
            totalAmount,
            shippingAddress: shippingAddressId,
            paymentMethod,
            status: paymentMethod === 'Wallet' ? 'Processing' : 'Pending',
            paymentStatus: paymentMethod === 'Wallet' ? 'Paid' : 'Pending'
        });

        if (paymentMethod === 'Wallet') {
            const transaction = new Transaction({
                userId: req.user.id,
                amount: totalAmount,
                type: 'debit',
                description: `Order Payment #${newOrder._id}`
            });
            await transaction.save();
        }

        const savedOrder = await newOrder.save();

        // Clear user's cart after successful order
        await Cart.findOneAndUpdate(
            { userId: req.user.id },
            { $set: { items: [] } }
        );

        res.json(savedOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/orders - Get user orders
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/orders/my - Get authenticated user's orders
router.get('/my', isAuthenticated, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .select('_id items totalAmount orderType paymentStatus status createdAt paymentMethod shippingAddress subscriptionId deliverySlot')
            .populate('items.product')
            .populate('shippingAddress')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/orders/:id - Get specific order details
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        let query = { _id: req.params.id };
        // If not admin, restrict to own orders
        if (req.user.role !== 'admin') {
            query.userId = req.user.id;
        }

        const order = await Order.findOne(query)
            .select('_id items totalAmount orderType paymentStatus status createdAt paymentMethod shippingAddress subscriptionId deliverySlot')
            .populate('items.product')
            .populate('shippingAddress');

        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
                reqUserId: req.user ? req.user.id : 'undefined',
                queriedId: req.params.id
            });
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADMIN ROUTES

// GET /api/orders/admin/all - Get all orders (Admin only)
router.get('/admin/all', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('userId', 'name email')
            .populate('items.product', 'name price image') // Populate product details for display
            .populate('shippingAddress')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/orders/admin/:id/status - Update order status (Admin only)
router.put('/admin/:id/status', isAuthenticated, isAdmin, async (req, res) => {
    const { status, paymentStatus } = req.body;
    try {
        const updateData = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/orders/admin/:id - Delete an order (Admin only)
router.delete('/admin/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
