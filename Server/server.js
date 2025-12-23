// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// DATABASE
import connectDB from './config/database.js';

// ROUTES
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import sellerRoutes from './routes/seller.routes.js';
import orderRoutes from './routes/order.routes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import searchRoutes from './routes/search.routes.js';
import materialRequirementRoutes from './routes/materialRequirement.routes.js';

// NEW CONTRACTOR ROUTES
import contractorAuthRoutes from './routes/contractor.auth.routes.js';
import contractorRoutes from './routes/contractor.routes.js';

// Load environment variables
dotenv.config();

const app = express();

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to Database
connectDB();

// CORS Configuration
const corsOptions = {
    origin: [
        // Local Development
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',

        // Production Frontends
        'https://bricksitnow.netlify.app',
        'https://bricks-com.vercel.app',
        'https://bricksitnow.co.in',

        // Dynamic from env
        process.env.FRONTEND_URL
    ].filter(Boolean), // Removes undefined/null values
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
    maxAge: 86400 // 24 hours
};

// Apply CORS middleware (this automatically handles preflight OPTIONS requests)
app.use(cors(corsOptions));
// REMOVED: app.options('*', cors(corsOptions)); → This was causing the crash!

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging in development
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Health Check Endpoints
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        version: '1.0.0',
        services: {
            database: 'connected',
            contractor_api: 'active',
            auth_api: 'active'
        }
    });
});

// Upload Routes
app.use('/api/upload', uploadRoutes);

// USER ROUTES
app.use('/api/user', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/users', userRoutes);

// CONTRACTOR ROUTES
app.use('/api/contractor/auth', contractorAuthRoutes);
app.use('/api/contractor', contractorRoutes);
app.use('/api/v1/contractor/auth', contractorAuthRoutes);
app.use('/api/v1/contractor', contractorRoutes);

// AUTH ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);

// OTHER ROUTES
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/seller', sellerRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/requirements', materialRequirementRoutes);

// Legacy routes (for backward compatibility)
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/requirements', materialRequirementRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'BuilderSmart Backend API',
        version: '2.0.0',
        contractor_support: true,
        docs: {
            health: '/health',
            auth: '/api/auth OR /api/v1/auth',
            contractor_auth: '/api/contractor/auth/register OR /api/contractor/auth/login',
            contractor_profile: '/api/contractor/profile',
            contractor_portfolio: '/api/contractor/portfolio',
            user_profile: '/api/user/profile',
            user_addresses: '/api/user/addresses',
            products: '/api/v1/products',
            categories: '/api/v1/categories'
        }
    });
});

// API Root
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'API Root',
        contractor_endpoints: {
            register: 'POST /api/contractor/auth/register',
            login: 'POST /api/contractor/auth/login',
            profile: 'GET /api/contractor/profile',
            portfolio: 'GET /api/contractor/portfolio'
        },
        user_endpoints: {
            profile: '/api/user/profile',
            addresses: '/api/user/addresses'
        },
        auth_endpoints: {
            user_register: '/api/auth/user/register',
            user_login: '/api/auth/user/login',
            seller_register: '/api/auth/seller/register',
            seller_login: '/api/auth/seller/login'
        }
    });
});

// Test Contractor Route
app.get('/api/test-contractor', (req, res) => {
    res.json({
        success: true,
        message: 'Contractor API is working!',
        endpoints: [
            'POST /api/contractor/auth/register',
            'POST /api/contractor/auth/login',
            'GET /api/contractor/profile',
            'GET /api/contractor/portfolio',
            'POST /api/contractor/portfolio'
        ]
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        available_routes: {
            contractor_auth: [
                'POST /api/contractor/auth/register',
                'POST /api/contractor/auth/login'
            ],
            contractor: [
                'GET /api/contractor/profile',
                'GET /api/contractor/portfolio',
                'POST /api/contractor/portfolio'
            ],
            user: [
                'GET /api/user/profile',
                'GET /api/user/addresses'
            ]
        }
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('🔥 Server Error:', err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Graceful Shutdown
process.on('SIGINT', () => {
    console.log('🛑 Server shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Server shutting down gracefully...');
    process.exit(0);
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`\n📋 CONTRACTOR ENDPOINTS:`);
    console.log(`   🔐 POST  /api/contractor/auth/register`);
    console.log(`   🔑 POST  /api/contractor/auth/login`);
    console.log(`   👤 GET   /api/contractor/profile`);
    console.log(`   🖼️  GET   /api/contractor/portfolio`);
    console.log(`   ➕ POST  /api/contractor/portfolio`);
    console.log(`\n👤 USER ENDPOINTS:`);
    console.log(`   📋 GET   /api/user/profile`);
    console.log(`   📍 GET   /api/user/addresses`);
    console.log(`   ➕ POST  /api/user/addresses`);
    console.log(`\n🔗 Test endpoint: http://localhost:${PORT}/api/test-contractor`);
});

export default server;