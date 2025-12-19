import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import multer from 'multer';
import fs from 'fs';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import sellerRoutes from './routes/seller.routes.js';
import orderRoutes from './routes/order.routes.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

/* ======================
   Database Connection
====================== */
connectDB();

/* ======================
   Create Uploads Directory if not exists
====================== */
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

/* ======================
   Multer Configuration for File Uploads
====================== */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: fileFilter
});

/* ======================
   Middleware
====================== */
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-CSRF-Token'],
    credentials: true,
    exposedHeaders: ['Content-Length', 'X-Request-Id', 'Content-Disposition']
}));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({
    limit: '50mb',
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
app.use(express.urlencoded({
    extended: true,
    limit: '50mb',
    parameterLimit: 1000000
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d',
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png')) {
            res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
        }
    }
}));

app.use('/public', express.static(path.join(__dirname, 'public')));

/* ======================
   Request Logging
====================== */
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
        if (req.body && Object.keys(req.body).length > 0 && req.method !== 'POST' && !req.originalUrl.includes('/upload')) {
            console.log('Body:', JSON.stringify(req.body, null, 2));
        }
    }
    next();
});

/* ======================
   Rate Limiting (Simple)
====================== */
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const MAX_REQUESTS = 100;

app.use((req, res, next) => {
    // Skip rate limiting for health check
    if (req.path === '/health' || req.path === '/api/status') {
        return next();
    }

    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimit.has(ip)) {
        rateLimit.set(ip, { count: 1, startTime: now });
    } else {
        const userData = rateLimit.get(ip);
        if (now - userData.startTime > RATE_LIMIT_WINDOW) {
            rateLimit.set(ip, { count: 1, startTime: now });
        } else {
            if (userData.count >= MAX_REQUESTS) {
                return res.status(429).json({
                    success: false,
                    message: 'Too many requests. Please try again later.'
                });
            }
            userData.count++;
        }
    }
    next();
});

/* ======================
   Health Check
====================== */
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: 'connected',
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

/* ======================
   File Upload Endpoints
====================== */
// Single file upload
app.post('/api/upload', (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.code === 'LIMIT_FILE_SIZE'
                        ? 'File too large. Maximum size is 10MB.'
                        : 'File upload error'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading file'
            });
        }

        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            const fileUrl = `/uploads/${req.file.filename}`;

            res.status(200).json({
                success: true,
                message: 'File uploaded successfully',
                imageUrl: fileUrl,
                filename: req.file.filename,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing uploaded file',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });
});

// Multiple files upload
app.post('/api/upload/multiple', (req, res, next) => {
    upload.array('images', 10)(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err instanceof multer.MulterError
                    ? err.code === 'LIMIT_FILE_SIZE'
                        ? 'File too large. Maximum size is 10MB.'
                        : 'File upload error'
                    : err.message || 'Error uploading files'
            });
        }

        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files uploaded'
                });
            }

            const fileUrls = req.files.map(file => ({
                url: `/uploads/${file.filename}`,
                filename: file.filename,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size
            }));

            res.status(200).json({
                success: true,
                message: 'Files uploaded successfully',
                files: fileUrls,
                count: req.files.length
            });
        } catch (error) {
            console.error('Multiple upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing uploaded files'
            });
        }
    });
});

/* ======================
   API Routes
====================== */
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/seller', sellerRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);

// Legacy API routes (for backward compatibility)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

/* ======================
   Root Route
====================== */
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to BuilderSmart Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            upload: '/api/upload',
            auth: '/api/v1/auth',
            products: '/api/v1/products',
            categories: '/api/v1/categories'
        }
    });
});

/* ======================
   Error Handling Middleware
====================== */

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        suggestions: [
            'Check the API documentation',
            'Verify the endpoint URL',
            'Ensure you are using the correct HTTP method'
        ]
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method
    });

    // Default to 500 if no status code
    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && {
            error: err.message,
            stack: err.stack
        })
    });
});

/* ======================
   Server Start
====================== */
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

const startServer = () => {
    const server = app.listen(PORT, HOST, () => {
        console.log('\n' + '='.repeat(60));
        console.log(`🚀 Server running on http://${HOST}:${PORT}`);
        console.log('='.repeat(60));
        console.log('\nAvailable endpoints:');
        console.log('  POST /api/upload           - Upload single image');
        console.log('  POST /api/v1/products      - Create product');
        console.log('  GET  /api/v1/categories    - Get categories');
        console.log('  GET  /health               - Health check\n');
    });

    // Handle server errors
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Trying ${parseInt(PORT) + 1}...`);
            app.listen(parseInt(PORT) + 1, HOST);
        } else {
            console.error('Server error:', error);
            process.exit(1);
        }
    });

    return server;
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start the server
startServer();

export default app;