const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        // Populate req.user for backward compatibility with existing routes that expect req.user
        req.user = req.session.user;
        return next();
    }
    return res.status(401).json({ message: 'Unauthorized: No active session' });
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
};

module.exports = { isAuthenticated, isAdmin };
