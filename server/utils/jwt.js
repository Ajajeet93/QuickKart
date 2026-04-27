const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_use_a_strong_secret_in_production';

// ── Access Token — short-lived, stateless ─────────────────────────
const ACCESS_TOKEN_EXPIRES_IN  = '15m';
const ACCESS_TOKEN_EXPIRY_MS   = 15 * 60 * 1000; // 15 minutes

// ── Refresh Token — long-lived, stored in DB ──────────────────────
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRY_MS  = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Short-lived access token — used to authenticate every API request.
 */
const generateAccessToken = (payload) =>
    jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });

/**
 * Long-lived refresh token — stored in MongoDB, used to silently
 * issue new access tokens. Deleted on logout to revoke the session.
 */
const generateRefreshToken = (payload) =>
    jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });

/**
 * Verify any JWT (access or refresh).
 * Returns decoded payload or null if invalid/expired.
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
};

/**
 * Cookie options for the short-lived ACCESS token.
 */
const accessCookieOptions = (isProduction) => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: ACCESS_TOKEN_EXPIRY_MS,
});

/**
 * Cookie options for the long-lived REFRESH token.
 */
const refreshCookieOptions = (isProduction) => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: REFRESH_TOKEN_EXPIRY_MS,
});

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    accessCookieOptions,
    refreshCookieOptions,
    ACCESS_TOKEN_EXPIRY_MS,
    REFRESH_TOKEN_EXPIRY_MS,
};
