/**
 * tokenService — DRY token issuance and revocation for both user and admin.
 *
 * BEFORE: issueTokens / revokeTokens were copy-pasted in:
 *   - routes/auth.js
 *   - routes/admin.js
 *   - src/modules/auth/auth.controller.js
 *
 * AFTER: One canonical implementation used everywhere.
 *
 * SOLID / DRY: Single Responsibility (owns token lifecycle),
 *              Don't Repeat Yourself (one copy).
 */
const RefreshToken = require('../../models/RefreshToken');
const {
    generateAccessToken,
    generateRefreshToken,
    accessCookieOptions,
    refreshCookieOptions,
    REFRESH_TOKEN_EXPIRY_MS,
} = require('./jwt');
const { blacklistToken } = require('./tokenBlacklist');
const env = require('../../config/env');

const isProduction = env.NODE_ENV === 'production';

/**
 * Issue a new access + refresh token pair and set httpOnly cookies.
 * Persists the refresh token to DB so it can be revoked on logout.
 *
 * @param {Object} user        - Mongoose user document (must have _id, name, email, role)
 * @param {Response} res       - Express response object
 * @param {'user'|'admin'} type - Which cookie names to use
 */
const issueTokens = async (user, res, type = 'user') => {
    const payload = {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
    };

    const accessToken  = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await RefreshToken.create({
        userId:    user._id,
        token:     refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    });

    const accessKey  = type === 'admin' ? 'admin_access_token'  : 'access_token';
    const refreshKey = type === 'admin' ? 'admin_refresh_token' : 'refresh_token';

    res.cookie(accessKey,  accessToken,  accessCookieOptions(isProduction));
    res.cookie(refreshKey, refreshToken, refreshCookieOptions(isProduction));

    return { accessToken, refreshToken };
};

/**
 * Revoke a refresh token from DB, blacklist the access token in Redis,
 * and clear both cookies.
 *
 * @param {string} refreshToken - The raw refresh token string
 * @param {Response} res
 * @param {'user'|'admin'} type
 * @param {import('express').Request} [req] - Express request (used to read access token cookie)
 */
const revokeTokens = async (refreshToken, res, type = 'user', req = null) => {
    // 1. Delete refresh token from MongoDB
    if (refreshToken) {
        await RefreshToken.deleteOne({ token: refreshToken }).catch(() => {});
    }

    const accessKey  = type === 'admin' ? 'admin_access_token'  : 'access_token';
    const refreshKey = type === 'admin' ? 'admin_refresh_token' : 'refresh_token';

    // 2. Blacklist the access token in Redis (key: token:<jwt>, value: "invalid")
    //    TTL is dynamic — derived from the token's own exp claim
    const accessToken = req?.cookies?.[accessKey];
    if (accessToken) {
        await blacklistToken(accessToken);
    }

    // 3. Clear both cookies from the browser
    const clearOpts = { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax' };
    res.clearCookie(accessKey,  clearOpts);
    res.clearCookie(refreshKey, clearOpts);
};

module.exports = { issueTokens, revokeTokens };
