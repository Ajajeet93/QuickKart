const authService   = require('./auth.service');
const catchAsync    = require('../../core/errors/CatchAsync');
const { issueTokens, revokeTokens } = require('../../core/utils/tokenService');
const { success, created } = require('../../core/utils/apiResponse');

/**
 * AuthController — thin HTTP layer for user authentication.
 *
 * DRY: Uses shared tokenService for cookie management (no duplicated
 *      issueTokens logic here — same as admin controller uses).
 */

exports.register = catchAsync(async (req, res) => {
    const user = await authService.registerUser(req.body);
    created(res, 'Registration successful', user);
});

exports.login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);

    // DRY: shared tokenService — no copy-paste of cookie logic
    await issueTokens(user, res, 'user');

    success(res, 200, 'Login successful', authService._getPublicProfile(user));
});

exports.googleLogin = catchAsync(async (req, res) => {
    const { credential } = req.body;
    const user = await authService.googleLogin(credential);
    
    await issueTokens(user, res, 'user');
    
    success(res, 200, 'Google Login successful', authService._getPublicProfile(user));
});

exports.refresh = catchAsync(async (req, res) => {
    const oldRefreshToken = req.cookies.refresh_token;
    const { newAccessToken, newRefreshToken } = await authService.rotateTokens(oldRefreshToken);

    const { accessCookieOptions, refreshCookieOptions } = require('../../core/utils/jwt');
    const env = require('../../config/env');
    const isProd = env.NODE_ENV === 'production';

    res.cookie('access_token',  newAccessToken,  accessCookieOptions(isProd));
    res.cookie('refresh_token', newRefreshToken, refreshCookieOptions(isProd));

    success(res, 200, 'Tokens rotated successfully');
});

exports.logout = catchAsync(async (req, res) => {
    // revokeTokens handles DB deletion, Redis blacklisting, and cookie clearing (DRY)
    await revokeTokens(req.cookies.refresh_token, res, 'user', req);
    success(res, 200, 'Logged out successfully');
});

exports.getMe = catchAsync(async (req, res) => {
    const user = await authService.getUserProfile(req.user.id);
    success(res, 200, 'Profile fetched', authService._getPublicProfile(user));
});

exports.updateProfile = catchAsync(async (req, res) => {
    // Only allow specific fields to be updated
    const { name, phone } = req.body;
    const user = await authService.updateUserProfile(req.user.id, { name, phone });
    success(res, 200, 'Profile updated', authService._getPublicProfile(user));
});
