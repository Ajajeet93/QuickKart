const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

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

module.exports = router;
