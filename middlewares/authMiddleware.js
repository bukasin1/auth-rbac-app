const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Invalid token' });

    req.user = decoded;
    next();
};

const authorizeRoles = (...roles) => {
    return async (req, res, next) => {
        const userExists = await User.findById(req.user.id);

        if (!roles.includes(userExists?.role)) {
            return res.status(403).json({ message: 'Access forbidden: insufficient permissions' });
        }
        next();
    };
};

module.exports = { authenticateToken, authorizeRoles };
