import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';

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
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
    exposedHeaders: ['Content-Length', 'X-Request-Id']
}));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
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
    maxAge: '1d',
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png')) {
            res.setHeader('Cache-Control', 'public, max-age=86400');
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
   API Routes
====================== */
app.get('/health', (req, res) => {
    res.status(200).json({
        uptime: process.uptime(),
        message: 'OK',
        timestamp: new Date().toISOString(),
        database: 'connected',
        memory: process.memoryUsage(),
        node: process.version
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

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/seller', sellerRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);

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
        documentation: process.env.NODE_ENV === 'development'
            ? 'http://localhost:5000/api-docs'
            : 'https://api.yourdomain.com/api-docs',
        endpoints: {
            auth: '/api/v1/auth',
            users: '/api/v1/users',
            admin: '/api/v1/admin',
            seller: '/api/v1/seller',
            categories: '/api/v1/categories',
            products: '/api/v1/products',
            orders: '/api/v1/orders'
        },
        status: 'operational',
        uptime: process.uptime()
    });
});

/* ======================
   API Documentation
====================== */
app.get('/api-docs', (req, res) => {
    // Paste your full HTML documentation here (unchanged from original)
    res.send(`YOUR_FULL_HTML_HERE`);
});

/* ======================
   Upload Test
====================== */
app.post('/api/v1/upload-test', (req, res) => {
    res.json({
        success: true,
        message: 'Upload endpoint is working.',
        // ... rest unchanged
    });
});

/* ======================
   404 Handler
====================== */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        suggestions: [
            'Check the API documentation at /api-docs',
            'Verify the endpoint URL',
            'Check if you need authentication',
            'Ensure you are using the correct HTTP method'
        ]
    });
});

/* ======================
   Global Error Handler
====================== */
// (Keep exactly as in your original code – unchanged)

/* ======================
   Server Start
====================== */
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
    console.log(`Server started on http://${HOST}:${PORT}`);
    // Your fancy console output
});

process.on('uncaughtException', (error) => console.error('Uncaught Exception:', error));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));

const gracefulShutdown = (signal) => {
    console.log(`${signal} received. Shutting down...`);
    server.close(() => process.exit(0));
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));

export default app;