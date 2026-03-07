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
import hotDealRoutes from './routes/hotDeal.routes.js';
import trendingRoutes from './routes/trending.routes.js';
// NEW CONTRACTOR ROUTES
import contractorAuthRoutes from './routes/contractor.auth.routes.js';
import contractorRoutes from './routes/contractor.routes.js';
import contractorSearch from './routes/contractorSearch.routes.js'


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
        'http://localhost:8081',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'https://bricksitnow.netlify.app',
        'https://bricks-com.vercel.app',
        'https://infrakarts.co.in',
        "https://www.infrakarts.co.in",
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
    maxAge: 86400
};

app.use(cors(corsOptions));

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
        version: '2.0.0',
        message: 'BuilderSmart API is healthy!',
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
app.use('/api/contractor-search',contractorSearch);
app.use('/api/v1/contractor/auth', contractorAuthRoutes);
app.use('/api/v1/contractor', contractorRoutes);
app.use('/api/v1/contractor-search',contractorSearch);
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
app.use('/api/v1/deals', hotDealRoutes);
app.use('/api/v1/trending', trendingRoutes);
// Legacy routes (backward compatibility)
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/requirements', materialRequirementRoutes);
app.use('/api/deals', hotDealRoutes);
app.use('/api/trending', trendingRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'BuilderSmart Backend API',
        version: '2.0.0',
        contractor_support: true,
        docs: {
            health: '/api/health',
            categories: '/api/v1/categories',
            products: '/api/v1/products',
            user_login: '/api/auth/user/login',
            contractor_login: '/api/contractor/auth/login'
        }
    });
});

// API Root
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'API Root - BuilderSmart',
        quick_links: {
            health_check: '/api/health',
            test_contractor: '/api/test-contractor',
            categories: '/api/v1/categories',
            featured_products: '/api/v1/products/featured'
        }
    });
});

// Test Contractor Route
app.get('/api/test-contractor', (req, res) => {
    res.json({
        success: true,
        message: 'Contractor API is working perfectly!',
        tip: 'Use this endpoint to verify server is reachable from mobile/emulator'
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        suggestion: 'Check /api/health or /api/test-contractor'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);

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
    console.log('Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    process.exit(0);
});

// ==================== SERVER START ====================
// Critical: Bind to 0.0.0.0 so Android emulator & real devices can connect!
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

let localIP = 'not detected';

// Detect local network IP (for real device testing on same WiFi)
(async () => {
    try {
        const os = await import('os');
        const interfaces = os.default.networkInterfaces(); // Note: .default in ESM
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    localIP = iface.address;
                    return;
                }
            }
        }
    } catch (err) {
        console.warn('Could not detect local network IP (this is okay for emulator)');
        localIP = 'unknown';
    }
})();

const server = app.listen(PORT, HOST, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode\n`);
    console.log(`🌍 Local (Your Browser):           http://localhost:${PORT}`);
    console.log(`📱 Android Emulator:              http://10.0.2.2:${PORT}`);
    console.log(`📶 Real Device (Same WiFi):        http://${localIP}:${PORT}\n`);

    console.log(`🩺 Health Check:                   http://localhost:${PORT}/api/health`);
    console.log(`🧪 Test Endpoint:                  http://localhost:${PORT}/api/test-contractor\n`);
    console.log(`✅ Now open Android Emulator browser and visit:`);
    console.log(`   http://10.0.2.2:${PORT}/api/health\n`);
});

export default server;
