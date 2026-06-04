const adminService  = require('./admin.service');
const catchAsync    = require('../../core/errors/CatchAsync');
const { issueTokens, revokeTokens } = require('../../core/utils/tokenService');
const { success, created, paginated } = require('../../core/utils/apiResponse');

/**
 * AdminController — thin HTTP layer. Each method:
 *   1. Extracts validated data from req (validation already ran as middleware)
 *   2. Delegates to adminService
 *   3. Sends a standardised response
 *
 * SOLID / SRP: No business logic here. No DB calls here.
 */

// ── Authentication ─────────────────────────────────────────────────

exports.login = catchAsync(async (req, res) => {
    const user = await adminService.login(req.body.email, req.body.password);
    await issueTokens(user, res, 'admin');
    success(res, 200, 'Admin login successful', {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
});

exports.refresh = catchAsync(async (req, res) => {
    // Token rotation lives in the legacy admin.js route for now;
    // this stub is here for the new module route.
    const { verifyRefreshToken, generateAccessToken, generateRefreshToken,
            accessCookieOptions, refreshCookieOptions, REFRESH_TOKEN_EXPIRY_MS } = require('../../core/utils/jwt');
    const RefreshToken = require('../../models/RefreshToken');
    const env = require('../../config/env');
    const isProd = env.NODE_ENV === 'production';

    const oldToken = req.cookies.admin_refresh_token;
    if (!oldToken) return res.status(401).json({ success: false, message: 'No admin refresh token provided' });

    const decoded = verifyRefreshToken(oldToken);
    if (!decoded || decoded.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Admin refresh token expired or invalid' });
    }

    const stored = await RefreshToken.findOne({ token: oldToken });
    if (!stored) return res.status(401).json({ success: false, message: 'Token already rotated or revoked' });

    await RefreshToken.deleteOne({ token: oldToken });

    const payload = { id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role };
    const newAccess  = generateAccessToken(payload);
    const newRefresh = generateRefreshToken(payload);

    await RefreshToken.create({ userId: decoded.id, token: newRefresh, expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS) });

    res.cookie('admin_access_token',  newAccess,  accessCookieOptions(isProd));
    res.cookie('admin_refresh_token', newRefresh, refreshCookieOptions(isProd));

    success(res, 200, 'Admin tokens rotated successfully');
});

exports.logout = catchAsync(async (req, res) => {
    await revokeTokens(req.cookies.admin_refresh_token, res, 'admin');
    success(res, 200, 'Logged out successfully');
});

exports.getMe = catchAsync(async (req, res) => {
    const User = require('../../models/User');
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    success(res, 200, 'Profile fetched', user);
});

// ── Dashboard ──────────────────────────────────────────────────────

exports.getStats = catchAsync(async (req, res) => {
    const data = await adminService.getDashboardStats();
    success(res, 200, 'Stats fetched', data);
});

// ── User Management ────────────────────────────────────────────────

exports.listUsers = catchAsync(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const { users, total, pages } = await adminService.listUsers(Number(page), Number(limit));
    paginated(res, 'Users fetched', { data: users, total, page: Number(page), pages });
});

exports.createUser = catchAsync(async (req, res) => {
    const user = await adminService.createUser(req.body);
    created(res, 'User created successfully', user);
});

exports.deleteUser = catchAsync(async (req, res) => {
    const result = await adminService.deleteUser(req.params.id);
    success(res, 200, result.message);
});

exports.getUserDetails = catchAsync(async (req, res) => {
    const data = await adminService.getUserDetails(req.params.id);
    success(res, 200, 'User details fetched', data);
});

// ── Order Management ───────────────────────────────────────────────

exports.listOrders = catchAsync(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const { orders, total, pages } = await adminService.listOrders(Number(page), Number(limit));
    paginated(res, 'Orders fetched', { data: orders, total, page: Number(page), pages });
});

exports.updateOrderStatus = catchAsync(async (req, res) => {
    const order = await adminService.updateOrderStatus(req.params.id, req.body);
    success(res, 200, 'Order status updated', order);
});

exports.deleteOrder = catchAsync(async (req, res) => {
    const result = await adminService.deleteOrder(req.params.id);
    success(res, 200, result.message);
});

// ── Support Management ─────────────────────────────────────────────

exports.listSupportRequests = catchAsync(async (req, res) => {
    const requests = await adminService.listSupportRequests();
    success(res, 200, 'Support requests fetched', requests);
});

exports.updateSupportStatus = catchAsync(async (req, res) => {
    const request = await adminService.updateSupportStatus(req.params.id, req.body);
    success(res, 200, 'Support request updated', request);
});
