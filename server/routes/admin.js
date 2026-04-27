const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    accessCookieOptions,
    refreshCookieOptions,
    REFRESH_TOKEN_EXPIRY_MS,
} = require('../utils/jwt');

const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

// ── Shared helper ─────────────────────────────────────────────────
async function issueTokens(user, res) {
    const payload = { id: user._id, name: user.name, email: user.email, role: user.role };
    const accessToken  = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    });

    res.cookie('access_token',  accessToken,  accessCookieOptions(isProduction));
    res.cookie('refresh_token', refreshToken, refreshCookieOptions(isProduction));
}

async function revokeTokens(req, res) {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
        await RefreshToken.deleteOne({ token: refreshToken }).catch(() => {});
    }
    res.clearCookie('access_token',  { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax' });
    res.clearCookie('refresh_token', { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax' });
}

// ────────────────────────────────────────────────────────────────
// POST /api/admin/login
// ────────────────────────────────────────────────────────────────
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

        await issueTokens(user, res);

        return res.json({
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ────────────────────────────────────────────────────────────────
// POST /api/admin/logout
// ────────────────────────────────────────────────────────────────
router.post('/logout', async (req, res) => {
    await revokeTokens(req, res);
    return res.json({ message: 'Logged out successfully' });
});

// ────────────────────────────────────────────────────────────────
// GET /api/admin/me
// ────────────────────────────────────────────────────────────────
router.get('/me', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// ────────────────────────────────────────────────────────────────
// GET /api/admin/stats
// ────────────────────────────────────────────────────────────────
router.get('/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const revenueAgg = await Order.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
        const totalOrders = await Order.countDocuments();
        const totalUsers  = await User.countDocuments();

        const oneDayAgo = new Date(new Date().setDate(new Date().getDate() - 1));
        const activeOrdersCount = await Order.distinct('userId', { createdAt: { $gte: oneDayAgo } });
        const newUsersCount = await User.countDocuments({ createdAt: { $gte: oneDayAgo } });
        const activeNow = activeOrdersCount.length + newUsersCount;

        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('userId', 'name email')
            .select('userId totalAmount status paymentStatus createdAt');

        return res.json({
            stats: { totalRevenue, totalOrders, totalUsers, activeNow },
            recentOrders,
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Server Error fetching dashboard stats' });
    }
});

const ReturnRequest = require('../models/ReturnRequest');

// ── USER MANAGEMENT ───────────────────────────────────────────────
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

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
        const newUser = new User({ name, email, password: hashedPassword, role: role || 'user', phone: phone || '' });
        await newUser.save();
        res.json({ message: 'User created successfully', user: newUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        // Also revoke all refresh tokens for deleted user
        await RefreshToken.deleteMany({ userId: req.params.id });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── ORDER MANAGEMENT ──────────────────────────────────────────────
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

router.delete('/orders/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── SUPPORT MANAGEMENT ────────────────────────────────────────────
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
