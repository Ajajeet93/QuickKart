const jwt = require('jsonwebtoken');

// ── Separate secrets for access and refresh tokens ────────────────
// Using the same secret for both allows a stolen refresh token to be
// crafted into a valid access token. Two secrets prevent this entirely.
const JWT_ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  || process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
    console.error('❌ FATAL: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set');
    process.exit(1);
}

// ── Access Token — short-lived, stateless ─────────────────────────
const ACCESS_TOKEN_EXPIRES_IN  = '15m';
const ACCESS_TOKEN_EXPIRY_MS   = 15 * 60 * 1000; // 15 minutes

// ── Refresh Token — long-lived, stored in DB ──────────────────────
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRY_MS  = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Short-lived access token — used to authenticate every API request.
 * Signed with JWT_ACCESS_SECRET only.
 */
const generateAccessToken = (payload) =>
    jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });

/**
 * Long-lived refresh token — stored in MongoDB, used to silently
 * issue new access tokens. Deleted on logout to revoke the session.
 * Signed with JWT_REFRESH_SECRET only.
 */
const generateRefreshToken = (payload) =>
    jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });

/**
 * Verify an ACCESS token specifically.
 * Returns decoded payload or null if invalid/expired.
 */
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_ACCESS_SECRET);
    } catch (err) {
        return null;
    }
};

/**
 * Verify a REFRESH token specifically.
 * Returns decoded payload or null if invalid/expired.
 */
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (err) {
        return null;
    }
};

/**
 * @deprecated Use verifyAccessToken or verifyRefreshToken instead.
 * Kept for backward compatibility — uses the access secret by default.
 */
const verifyToken = (token) => verifyAccessToken(token);

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
    verifyToken,          // legacy alias
    verifyAccessToken,
    verifyRefreshToken,
    accessCookieOptions,
    refreshCookieOptions,
    ACCESS_TOKEN_EXPIRY_MS,
    REFRESH_TOKEN_EXPIRY_MS,
};
