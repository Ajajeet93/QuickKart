const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

const bcrypt = require('bcryptjs');

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Please enter all fields' });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User does not exist' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access Denied: Admins only' });
        }

        const userSession = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        };

        req.session.user = userSession;

        req.session.save((err) => {
            if (err) return res.status(500).json({ error: 'Session creation failed' });
            res.json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: 'Logout failed' });
        res.clearCookie('admin.sid');
        res.json({ message: 'Logged out successfully' });
    });
});

// Get Current Admin
router.get('/me', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/admin/stats - Get Dashboard Stats
router.get('/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
        // 1. Total Revenue (Sum of all non-cancelled orders or just Paid? Let's use Paid)
        // Aggregation to sum totalAmount of paid orders
        const revenueAgg = await Order.aggregate([
            { $match: { paymentStatus: 'Paid' } }, // Only count confirmed revenue
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // 2. Total Orders (All orders)
        const totalOrders = await Order.countDocuments();

        // 3. Total Users (All users)
        const totalUsers = await User.countDocuments();

        // 4. "Active Now" - Approximate as users who logged in or created account recently.
        // Since we don't have lastLogin, let's use "Orders in last 24h" + "Users created in last 24h" as a proxy for 'Active Today'
        const oneDayAgo = new Date(new Date().setDate(new Date().getDate() - 1));

        const activeOrdersCount = await Order.distinct('userId', { createdAt: { $gte: oneDayAgo } });
        const newUsersCount = await User.countDocuments({ createdAt: { $gte: oneDayAgo } });

        // Simple heuristic: Unique users who ordered + New users (approx active)
        const activeNow = activeOrdersCount.length + newUsersCount;

        // 5. Recent Orders (Last 5-10)
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('userId', 'name email') // Get user details
            .select('userId totalAmount status paymentStatus createdAt options'); // Select specific fields

        res.json({
            stats: {
                totalRevenue,
                totalOrders,
                totalUsers,
                activeNow, // Rebranding as "Active Today" in UI potentially
            },
            recentOrders
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Server Error fetching dashboard stats' });
    }
});

const ReturnRequest = require('../models/ReturnRequest');

// --- USER MANAGEMENT ---

// GET /api/admin/users - Get all users
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/admin/users - Create a new user
router.post('/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
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

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- ORDER MANAGEMENT ---

// GET /api/admin/orders - Get all orders
router.get('/orders', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('userId', 'name email')
            .populate('items.product', 'name price image')
            .populate('shippingAddress')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/admin/orders/:id/status - Update order status
router.put('/orders/:id/status', isAuthenticated, isAdmin, async (req, res) => {
    const { status, paymentStatus } = req.body;
    try {
        const updateData = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/admin/orders/:id - Delete an order
router.delete('/orders/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- SUPPORT MANAGEMENT ---

// GET /api/admin/support - Get all support requests
router.get('/support', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const requests = await ReturnRequest.find({})
            .populate('userId', 'name email')
            .populate('orderId')
            .populate('items.productId', 'name image')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/admin/support/:id/status - Update request status
router.put('/support/:id/status', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        const request = await ReturnRequest.findByIdAndUpdate(
            req.params.id,
            { status, adminResponse },
            { new: true }
        );
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
