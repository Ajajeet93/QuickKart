const Order       = require('../../models/Order');
const User        = require('../../models/User');
const Product     = require('../../models/Product');
const Category    = require('../../models/Category');
const RefreshToken = require('../../models/RefreshToken');
const ReturnRequest = require('../../models/ReturnRequest');

/**
 * AdminRepository — all admin-scoped database operations.
 *
 * SOLID / DIP: The service layer never imports Mongoose directly.
 *              Swapping from MongoDB to another DB only touches this file.
 */
class AdminRepository {
    // ── Auth ────────────────────────────────────────────────────────
    findUserByEmail(email)    { return User.findOne({ email }); }
    findUserById(id)          { return User.findById(id).select('-password'); }
    revokeUserTokens(userId)  { return RefreshToken.deleteMany({ userId }); }

    // ── Stats ────────────────────────────────────────────────────────
    async getRevenueTotal() {
        const agg = await Order.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]);
        return agg[0]?.total ?? 0;
    }

    countOrders()                   { return Order.countDocuments(); }
    countUsers()                    { return User.countDocuments({ role: 'user' }); }
    countProducts()                 { return Product.countDocuments(); }
    countUsersCreatedAfter(date)    { return User.countDocuments({ createdAt: { $gte: date } }); }
    distinctOrderUserIds(date)      { return Order.distinct('userId', { createdAt: { $gte: date } }); }

    getRevenueByDay(from) {
        return Order.aggregate([
            { $match: { paymentStatus: 'Paid', createdAt: { $gte: from } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);
    }

    getOrdersByStatus() {
        return Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    }

    getTopProducts() {
        return Order.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
            { $project: { name: { $ifNull: ['$product.name', 'Deleted Product'] }, totalSold: 1 } },
        ]);
    }

    getCategoryDistribution() {
        return Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
        ]);
    }

    getLowStockProducts(threshold = 10) {
        return Product.find({ stock: { $lte: threshold } })
            .select('name stock category image').sort({ stock: 1 }).limit(20);
    }

    getRecentOrders() {
        return Order.find()
            .sort({ createdAt: -1 }).limit(10)
            .populate('userId', 'name email')
            .select('userId totalAmount status paymentStatus createdAt');
    }

    // ── User management ─────────────────────────────────────────────
    findAllUsers(skip, limit) {
        return User.find({}).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit);
    }
    countAllUsers() { return User.countDocuments({}); }

    createUser(data)   { return User.create(data); }
    deleteUser(id)     { return User.findByIdAndDelete(id); }

    getUserOrders(userId) {
        return Order.find({ userId })
            .populate('items.product', 'name price image')
            .sort({ createdAt: -1 });
    }

    // ── Order management ────────────────────────────────────────────
    findAllOrders(skip, limit) {
        return Order.find({})
            .populate('userId', 'name email')
            .populate('items.product', 'name price image')
            .populate('shippingAddress')
            .sort({ createdAt: -1 }).skip(skip).limit(limit);
    }
    countAllOrders() { return Order.countDocuments({}); }

    findOrderById(id)  { return Order.findById(id); }
    updateOrderFields(id, updateData) {
        return Order.findByIdAndUpdate(id, updateData, { new: true });
    }
    deleteOrder(id) { return Order.findByIdAndDelete(id); }

    // ── Support management ──────────────────────────────────────────
    findAllSupportRequests() {
        return ReturnRequest.find({})
            .populate('userId', 'name email')
            .populate('orderId')
            .populate('items.productId', 'name image')
            .sort({ createdAt: -1 });
    }
    updateSupportRequest(id, data) {
        return ReturnRequest.findByIdAndUpdate(id, data, { new: true });
    }
}

module.exports = new AdminRepository();
