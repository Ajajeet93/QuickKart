const { verifyAccessToken } = require('../utils/jwt');
const { isTokenBlacklisted } = require('../utils/tokenBlacklist');

/**
 * isAuthenticated — verifies the short-lived ACCESS token from the httpOnly cookie.
 * Also checks the Redis blacklist to reject tokens invalidated on logout.
 * Sets req.user = { id, name, email, role, iat, exp } on success.
 * Returns 401 if missing, expired, or blacklisted.
 */
const isAuthenticated = async (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No access token' });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
        return res.status(401).json({ message: 'Unauthorized: Access token expired or invalid' });
    }

    // Check Redis blacklist — token may have been invalidated on logout
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
        return res.status(401).json({ message: 'Unauthorized: Token has been revoked' });
    }

    req.user = decoded;
    return next();
};

/**
 * isAdmin — must be used AFTER isAuthenticated.
 * Rejects non-admin users with 403.
 */
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
};

/**
 * isAdminAuthenticated — verifies the admin-specific ACCESS token.
 * Also checks the Redis blacklist to reject tokens invalidated on logout.
 * Uses `admin_access_token` cookie to prevent collision with client app.
 */
const isAdminAuthenticated = async (req, res, next) => {
    const token = req.cookies.admin_access_token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No admin access token' });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded || decoded.role !== 'admin') {
        return res.status(401).json({ message: 'Unauthorized: Admin access token expired or invalid' });
    }

    // Check Redis blacklist — token may have been invalidated on logout
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
        return res.status(401).json({ message: 'Unauthorized: Token has been revoked' });
    }

    req.user = decoded;
    return next();
};

module.exports = { isAuthenticated, isAdmin, isAdminAuthenticated };
