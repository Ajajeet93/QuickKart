const { verifyToken } = require('../utils/jwt');

/**
 * isAuthenticated — verifies the short-lived ACCESS token from the httpOnly cookie.
 * Sets req.user = { id, name, email, role, iat, exp } on success.
 * Returns 401 if missing or expired — the client interceptor will then
 * transparently call POST /api/auth/refresh to get a new access token.
 */
const isAuthenticated = (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No access token' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ message: 'Unauthorized: Access token expired or invalid' });
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

module.exports = { isAuthenticated, isAdmin };
