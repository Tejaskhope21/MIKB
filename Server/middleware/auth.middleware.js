import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

/* =======================
   PROTECT
======================= */
export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token missing'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        req.userId = user._id;
        req.role = user.role?.toLowerCase(); // normalize role

        next();
    } catch (error) {
        console.error('JWT Error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

/* =======================
   AUTHORIZE
======================= */
export const authorize = (...roles) => {
    const allowedRoles = roles.map(r => r.toLowerCase());

    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.role)) {
            return res.status(403).json({
                success: false,
                message: `Role ${req.user?.role} is not authorized`
            });
        }
        next();
    };
};

/* =======================
   CHECK ACTIVE (FIXED)
======================= */
export const checkActive = (req, res, next) => {
    if (req.user && req.user.isActive === false) {
        return res.status(403).json({
            success: false,
            message: 'Your account is deactivated'
        });
    }
    next();
};
