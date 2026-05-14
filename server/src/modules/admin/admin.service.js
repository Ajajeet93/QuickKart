const bcrypt = require('bcryptjs');
const adminRepository = require('./admin.repository');
const {
    UnauthorizedError,
    NotFoundError,
    BadRequestError,
    ConflictError,
} = require('../../core/errors/AppError');
const { stripHtml } = require('../../core/utils/sanitize');

/**
 * AdminService — all admin business logic.
 *
 * SOLID / SRP: This class is responsible only for admin business rules.
 *              It does not know about HTTP, cookies, or MongoDB query syntax.
 * SOLID / DIP: Depends on adminRepository (abstraction), not Mongoose (concretion).
 */
class AdminService {

    // ── Authentication ──────────────────────────────────────────────

    async login(email, password) {
        const user = await adminRepository.findUserByEmail(email);

        // Constant-time compare even when user not found (timing attack prevention)
        const dummyHash = '$2a$10$abcdefghijklmnopqrstuuABC123DEF456GHI789JKL012MNO345PQR';
        const isMatch = user
            ? await bcrypt.compare(password, user.password)
            : await bcrypt.compare(password, dummyHash).then(() => false);

        if (!user || !isMatch || user.role !== 'admin') {
            throw new UnauthorizedError('Invalid credentials');
        }

        return user;
    }

    // ── Dashboard Stats ─────────────────────────────────────────────

    async getDashboardStats() {
        const oneDayAgo   = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [
            totalRevenue, totalOrders, totalUsers, totalProducts,
            activeOrderUsers, newUsersCount,
            revenueByDayRaw, ordersByStatusRaw,
            topProductsRaw, categoryDistRaw,
            lowStockProducts, recentOrders,
        ] = await Promise.all([
            adminRepository.getRevenueTotal(),
            adminRepository.countOrders(),
            adminRepository.countUsers(),
            adminRepository.countProducts(),
            adminRepository.distinctOrderUserIds(oneDayAgo),
            adminRepository.countUsersCreatedAfter(oneDayAgo),
            adminRepository.getRevenueByDay(sevenDaysAgo),
            adminRepository.getOrdersByStatus(),
            adminRepository.getTopProducts(),
            adminRepository.getCategoryDistribution(),
            adminRepository.getLowStockProducts(),
            adminRepository.getRecentOrders(),
        ]);

        const activeNow = activeOrderUsers.length + newUsersCount;

        // Build full 7-day revenue series (fill zeros for missing days)
        const revenueByDay = [];
        for (let i = 6; i >= 0; i--) {
            const d   = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().split('T')[0];
            const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            const found = revenueByDayRaw.find(r => r._id === key);
            revenueByDay.push({ date: label, revenue: found?.revenue ?? 0, orders: found?.orders ?? 0 });
        }

        return {
            stats:               { totalRevenue, totalOrders, totalUsers, activeNow, totalProducts },
            revenueByDay,
            ordersByStatus:      ordersByStatusRaw.map(o => ({ name: o._id, value: o.count })),
            topProducts:         topProductsRaw.map(p => ({ name: p.name, sold: p.totalSold })),
            categoryDistribution: categoryDistRaw.map(c => ({ name: c._id || 'Uncategorized', value: c.count })),
            lowStockProducts,
            recentOrders,
        };
    }

    // ── User Management ─────────────────────────────────────────────

    async listUsers(page, limit) {
        const skip  = (page - 1) * limit;
        const [users, total] = await Promise.all([
            adminRepository.findAllUsers(skip, limit),
            adminRepository.countAllUsers(),
        ]);
        return { users, total, page, pages: Math.ceil(total / limit) };
    }

    async createUser({ name, email, password, role, phone }) {
        const existing = await adminRepository.findUserByEmail(email);
        if (existing) throw new ConflictError('User with this email already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await adminRepository.createUser({
            name, email, password: hashedPassword,
            role: role || 'user',
            phone: phone || '',
        });

        const { password: _, ...safeUser } = newUser.toObject();
        return safeUser;
    }

    async deleteUser(userId) {
        const user = await adminRepository.deleteUser(userId);
        if (!user) throw new NotFoundError('User not found');
        await adminRepository.revokeUserTokens(userId);
        return { message: 'User deleted' };
    }

    async getUserDetails(userId) {
        const user = await adminRepository.findUserById(userId);
        if (!user) throw new NotFoundError('User not found');

        const orders = await adminRepository.getUserOrders(userId);

        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => {
            if (order.paymentStatus === 'Paid' || order.status === 'Delivered') {
                return sum + (order.totalAmount || 0);
            }
            return sum;
        }, 0);

        return { user, orders, totalOrders, totalSpent };
    }

    // ── Order Management ────────────────────────────────────────────

    async listOrders(page, limit) {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            adminRepository.findAllOrders(skip, limit),
            adminRepository.countAllOrders(),
        ]);
        return { orders, total, page, pages: Math.ceil(total / limit) };
    }

    async updateOrderStatus(orderId, { status, paymentStatus }) {
        // ── Terminal-state guard ──────────────────────────────────────
        // Delivered and Cancelled are irreversible final states.
        // No status change is allowed once an order reaches either.
        const existing = await adminRepository.findOrderById(orderId);
        if (!existing) throw new NotFoundError('Order not found');

        const TERMINAL = ['Delivered', 'Cancelled'];
        if (TERMINAL.includes(existing.status)) {
            throw new BadRequestError(
                `Order is already ${existing.status}. Status cannot be changed.`
            );
        }

        const updateData = {};
        if (status)        updateData.status        = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        const order = await adminRepository.updateOrderFields(orderId, updateData);
        return order;
    }

    async deleteOrder(orderId) {
        const order = await adminRepository.deleteOrder(orderId);
        if (!order) throw new NotFoundError('Order not found');
        return { message: 'Order deleted' };
    }

    // ── Support Management ──────────────────────────────────────────

    async listSupportRequests() {
        return adminRepository.findAllSupportRequests();
    }

    async updateSupportStatus(requestId, { status, adminResponse }) {
        const update = { status };
        if (adminResponse) update.adminResponse = stripHtml(adminResponse);

        const request = await adminRepository.updateSupportRequest(requestId, update);
        if (!request) throw new NotFoundError('Support request not found');
        return request;
    }
}

module.exports = new AdminService();
