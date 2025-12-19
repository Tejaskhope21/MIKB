import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

/* =======================
   JWT Verification Helper
======================= */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error(error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token');
    }
};

/* =======================
   PROTECT - Enhanced with better error handling
======================= */
export const protect = async (req, res, next) => {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check cookies (optional)
    else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please login.',
            code: 'NO_TOKEN'
        });
    }

    try {
        const decoded = verifyToken(token);

        // Get user from database
        const user = await User.findById(decoded.id).select('-password -__v');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User account no longer exists',
                code: 'USER_NOT_FOUND'
            });
        }

        // Check if user is active
        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated',
                code: 'ACCOUNT_DEACTIVATED'
            });
        }

        // Check if user is verified (optional)
        if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && !user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email address',
                code: 'EMAIL_NOT_VERIFIED'
            });
        }

        // Attach user to request
        req.user = user;
        req.userId = user._id;
        req.role = user.role?.toLowerCase();
        req.userEmail = user.email;

        next();
    } catch (error) {
        console.error('Authentication Error:', error.message);

        let statusCode = 401;
        let message = 'Authentication failed';
        let code = 'AUTH_FAILED';

        if (error.message === 'Token expired') {
            statusCode = 401;
            message = 'Session expired. Please login again.';
            code = 'TOKEN_EXPIRED';
        } else if (error.message === 'Invalid token') {
            statusCode = 401;
            message = 'Invalid authentication token';
            code = 'INVALID_TOKEN';
        }

        return res.status(statusCode).json({
            success: false,
            message,
            code,
            ...(process.env.NODE_ENV === 'development' && { debug: error.message })
        });
    }
};

/* =======================
   AUTHORIZE - Enhanced with better role handling
======================= */
export const authorize = (...roles) => {
    const allowedRoles = roles.map(r => r.toLowerCase());

    return (req, res, next) => {
        // First ensure user is authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'NOT_AUTHENTICATED'
            });
        }

        // Check if user has required role
        if (!allowedRoles.includes(req.role)) {
            console.warn(`Unauthorized access attempt by user ${req.user._id} with role ${req.user.role}`);

            return res.status(403).json({
                success: false,
                message: `Access denied. ${req.user.role} role is not authorized for this action.`,
                code: 'INSUFFICIENT_PERMISSIONS',
                requiredRoles: allowedRoles,
                userRole: req.user.role
            });
        }

        next();
    };
};

/* =======================
   CHECK ACTIVE - Enhanced with optional features
======================= */
export const checkActive = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
            code: 'NOT_AUTHENTICATED'
        });
    }

    if (req.user.isActive === false) {
        return res.status(403).json({
            success: false,
            message: 'Your account has been deactivated. Please contact support.',
            code: 'ACCOUNT_DEACTIVATED',
            supportEmail: process.env.SUPPORT_EMAIL
        });
    }

    // Optional: Check if account is suspended
    if (req.user.suspendedUntil && req.user.suspendedUntil > new Date()) {
        return res.status(403).json({
            success: false,
            message: `Account suspended until ${req.user.suspendedUntil.toLocaleDateString()}`,
            code: 'ACCOUNT_SUSPENDED',
            suspendedUntil: req.user.suspendedUntil
        });
    }

    next();
};

/* =======================
   CHECK VERIFIED - For email verification
======================= */
export const checkVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
            code: 'NOT_AUTHENTICATED'
        });
    }

    if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && !req.user.isVerified) {
        return res.status(403).json({
            success: false,
            message: 'Please verify your email address to access this resource',
            code: 'EMAIL_NOT_VERIFIED',
            canResend: true
        });
    }

    next();
};

/* =======================
   RESTRICT TO SELF - For user-specific operations
======================= */
export const restrictToSelf = (paramName = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'NOT_AUTHENTICATED'
            });
        }

        const requestedId = req.params[paramName];

        // Allow admin to access any user's data
        if (req.role === 'admin') {
            return next();
        }

        // Users can only access their own data
        if (requestedId !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only access your own data',
                code: 'NOT_OWNER'
            });
        }

        next();
    };
};

/* =======================
   CHECK PERMISSIONS - For specific permission checks
======================= */
export const checkPermissions = (permissions = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'NOT_AUTHENTICATED'
            });
        }

        // If user has all required permissions
        const hasAllPermissions = permissions.every(permission =>
            req.user.permissions?.includes(permission)
        );

        if (!hasAllPermissions && req.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                code: 'INSUFFICIENT_PERMISSIONS',
                requiredPermissions: permissions
            });
        }

        next();
    };
};

/* =======================
   LOG REQUEST - For logging and monitoring
======================= */
export const logRequest = (req, res, next) => {
    const start = Date.now();

    // Capture the response end to log duration
    const originalEnd = res.end;
    res.end = function (...args) {
        const duration = Date.now() - start;
        const logData = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            userId: req.user?._id || 'anonymous',
            ip: req.ip
        };

        // Log based on environment
        if (process.env.NODE_ENV === 'development') {
            console.log('Request Log:', logData);
        } else if (duration > 1000) {
            // Log slow requests in production
            console.warn('Slow Request:', logData);
        }

        originalEnd.apply(res, args);
    };

    next();
};

/* =======================
   RATE LIMIT - Basic rate limiting
======================= */
const rateLimitStore = new Map();

export const rateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        if (!rateLimitStore.has(ip)) {
            rateLimitStore.set(ip, {
                count: 1,
                startTime: now,
                resetTime: now + windowMs
            });
        } else {
            const userData = rateLimitStore.get(ip);

            // Reset if window has passed
            if (now - userData.startTime > windowMs) {
                rateLimitStore.set(ip, {
                    count: 1,
                    startTime: now,
                    resetTime: now + windowMs
                });
            } else {
                if (userData.count >= maxRequests) {
                    return res.status(429).json({
                        success: false,
                        message: 'Too many requests. Please try again later.',
                        code: 'RATE_LIMIT_EXCEEDED',
                        retryAfter: Math.ceil((userData.resetTime - now) / 1000)
                    });
                }
                userData.count++;
            }
        }

        // Cleanup old entries periodically
        if (Math.random() < 0.01) { // 1% chance to cleanup
            const cutoff = now - windowMs;
            for (const [key, value] of rateLimitStore.entries()) {
                if (value.startTime < cutoff) {
                    rateLimitStore.delete(key);
                }
            }
        }

        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', maxRequests - rateLimitStore.get(ip).count);
        res.setHeader('X-RateLimit-Reset', rateLimitStore.get(ip).resetTime);

        next();
    };
};

/* =======================
   ERROR HANDLER MIDDLEWARE
======================= */
export const errorHandler = (err, req, res, next) => {
    console.error('Middleware Error:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        userId: req.user?._id
    });

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/* =======================
   EXPORT ALL MIDDLEWARE
======================= */
export default {
    protect,
    authorize,
    checkActive,
    checkVerified,
    restrictToSelf,
    checkPermissions,
    logRequest,
    rateLimit,
    errorHandler
};