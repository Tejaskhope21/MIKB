import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import Seller from '../models/User.model.js';
import Contractor from '../models/Contractor.model.js';

/* =======================
   JWT Verification Helper
======================= */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_please_change_in_production');
    } catch (error) {
        throw new Error(error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token');
    }
};

/* =======================
   GET USER BY ROLE
======================= */
const getUserByRoleAndId = async (role, id) => {
    let user;

    switch (role) {
        case 'user':
            user = await User.findById(id).select('-password -__v');
            break;
        case 'seller':
            user = await Seller.findById(id).select('-password -__v');
            break;
        case 'contractor':
            user = await Contractor.findById(id).select('-password -__v');
            break;
        case 'admin':
            user = await User.findById(id).select('-password -__v');
            if (!user || user.role !== 'ADMIN') {
                throw new Error('Not authorized as admin');
            }
            break;
        default:
            throw new Error('Invalid user role');
    }

    return user;
};

/* =======================
   PROTECT - Enhanced with better error handling for multiple user types
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
    // Check x-auth-token header (alternative)
    else if (req.headers['x-auth-token']) {
        token = req.headers['x-auth-token'];
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

        // Check if decoded has role
        if (!decoded.role) {
            // If no role in token, assume it's an old token for user
            decoded.role = 'user';
        }

        // Get user from appropriate collection based on role
        const user = await getUserByRoleAndId(decoded.role, decoded.id);

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

        // Check if user is verified (optional - for sellers and contractors)
        if (decoded.role === 'seller' || decoded.role === 'contractor') {
            if (process.env.REQUIRE_VERIFICATION === 'true' && !user.isVerified) {
                return res.status(403).json({
                    success: false,
                    message: 'Please complete verification process',
                    code: 'NOT_VERIFIED',
                    verificationStatus: user.verificationStatus
                });
            }
        }

        // For email verification (users)
        if (decoded.role === 'user' && process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && !user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email address',
                code: 'EMAIL_NOT_VERIFIED'
            });
        }

        // Attach user to request with role info
        req.user = user;
        req.userId = user._id;
        req.role = decoded.role; // Store the role from token
        req.userRole = user.role?.toLowerCase(); // Store user's actual role from DB
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
        } else if (error.message === 'Not authorized as admin') {
            statusCode = 403;
            message = 'Admin access required';
            code = 'NOT_ADMIN';
        } else if (error.message === 'Invalid user role') {
            statusCode = 400;
            message = 'Invalid user role in token';
            code = 'INVALID_ROLE';
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
   AUTHORIZE - Enhanced with better role handling for multiple user types
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
        const userRole = req.role || req.userRole;

        if (!allowedRoles.includes(userRole)) {
            console.warn(`Unauthorized access attempt by user ${req.user._id} with role ${userRole}`);

            return res.status(403).json({
                success: false,
                message: `Access denied. ${userRole} role is not authorized for this action.`,
                code: 'INSUFFICIENT_PERMISSIONS',
                requiredRoles: allowedRoles,
                userRole: userRole
            });
        }

        next();
    };
};

/* =======================
   CHECK ACTIVE - Enhanced for multiple user types
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

    // Optional: Check if account is suspended (for contractors and sellers)
    if (req.role === 'contractor' || req.role === 'seller') {
        if (req.user.verificationStatus === 'suspended') {
            return res.status(403).json({
                success: false,
                message: 'Account suspended. Please contact support.',
                code: 'ACCOUNT_SUSPENDED'
            });
        }

        if (req.user.suspendedUntil && req.user.suspendedUntil > new Date()) {
            return res.status(403).json({
                success: false,
                message: `Account suspended until ${req.user.suspendedUntil.toLocaleDateString()}`,
                code: 'ACCOUNT_SUSPENDED',
                suspendedUntil: req.user.suspendedUntil
            });
        }
    }

    next();
};

/* =======================
   CHECK VERIFIED - For different verification types
======================= */
export const checkVerified = (type = 'email') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'NOT_AUTHENTICATED'
            });
        }

        if (type === 'email' && !req.user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email address to access this resource',
                code: 'EMAIL_NOT_VERIFIED',
                canResend: true
            });
        }

        if (type === 'seller' && req.role === 'seller' && !req.user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Seller account verification pending',
                code: 'SELLER_NOT_VERIFIED',
                verificationStatus: req.user.verificationStatus
            });
        }

        if (type === 'contractor' && req.role === 'contractor' && !req.user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Contractor account verification pending',
                code: 'CONTRACTOR_NOT_VERIFIED',
                verificationStatus: req.user.verificationStatus
            });
        }

        next();
    };
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
        if (req.role === 'admin' || req.userRole === 'admin') {
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
   RESTRICT TO OWNER - For resource ownership checks
======================= */
export const restrictToOwner = (model, paramName = 'id', ownerField = 'userId') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                    code: 'NOT_AUTHENTICATED'
                });
            }

            const resourceId = req.params[paramName];
            const resource = await model.findById(resourceId);

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found',
                    code: 'RESOURCE_NOT_FOUND'
                });
            }

            // Allow admin to access any resource
            if (req.role === 'admin' || req.userRole === 'admin') {
                return next();
            }

            // Check if user owns the resource
            const ownerId = resource[ownerField];
            if (ownerId.toString() !== req.userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not own this resource',
                    code: 'NOT_OWNER'
                });
            }

            next();
        } catch (error) {
            console.error('Owner restriction error:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                code: 'SERVER_ERROR'
            });
        }
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

        // Admin has all permissions
        if (req.role === 'admin' || req.userRole === 'admin') {
            return next();
        }

        // Check if user has all required permissions
        const hasAllPermissions = permissions.every(permission =>
            req.user.permissions?.includes(permission)
        );

        if (!hasAllPermissions) {
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
   CHECK CONTRACTOR VERIFICATION - Specific for contractors
======================= */
export const checkContractorVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
            code: 'NOT_AUTHENTICATED'
        });
    }

    if (req.role !== 'contractor') {
        return res.status(403).json({
            success: false,
            message: 'Contractor access required',
            code: 'NOT_CONTRACTOR'
        });
    }

    if (!req.user.isVerified) {
        return res.status(403).json({
            success: false,
            message: 'Contractor verification required. Please complete your profile verification.',
            code: 'CONTRACTOR_NOT_VERIFIED',
            verificationStatus: req.user.verificationStatus
        });
    }

    next();
};

/* =======================
   CHECK SELLER VERIFICATION - Specific for sellers
======================= */
export const checkSellerVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
            code: 'NOT_AUTHENTICATED'
        });
    }

    if (req.role !== 'seller') {
        return res.status(403).json({
            success: false,
            message: 'Seller access required',
            code: 'NOT_SELLER'
        });
    }

    if (!req.user.isVerified) {
        return res.status(403).json({
            success: false,
            message: 'Seller verification required. Please complete store verification.',
            code: 'SELLER_NOT_VERIFIED',
            verificationStatus: req.user.verificationStatus
        });
    }

    next();
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
            userRole: req.role || 'guest',
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
        userId: req.user?._id,
        userRole: req.role
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
   CORS MIDDLEWARE - Enhanced
======================= */
export const corsMiddleware = (req, res, next) => {
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'https://bricksitnow.netlify.app',
        'https://bricks-com.vercel.app',
        'https://bricksitnow.co.in',
        process.env.FRONTEND_URL
    ].filter(Boolean);

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
};

/* =======================
   VALIDATE REQUEST BODY
======================= */
export const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const { error, value } = schema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                const errors = error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }));

                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    errors
                });
            }

            req.body = value;
            next();
        } catch (err) {
            console.error('Validation error:', err);
            return res.status(500).json({
                success: false,
                message: 'Validation error',
                code: 'VALIDATION_ERROR'
            });
        }
    };
};

/* =======================
   SANITIZE INPUT - Basic XSS protection
======================= */
export const sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;

        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'string') {
                // Basic XSS protection - escape HTML
                obj[key] = obj[key]
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;')
                    .replace(/\//g, '&#x2F;');
            } else if (typeof obj[key] === 'object') {
                sanitize(obj[key]);
            }
        });
    };

    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);

    next();
};

/* =======================
   EXPORT ALL MIDDLEWARE
======================= */
export default {
    protect,
    authorize,
    checkActive,
    checkVerified,
    checkContractorVerified,
    checkSellerVerified,
    restrictToSelf,
    restrictToOwner,
    checkPermissions,
    logRequest,
    rateLimit,
    corsMiddleware,
    validateRequest,
    sanitizeInput,
    errorHandler
};