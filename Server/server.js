import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// DB
import connectDB from './config/database.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import sellerRoutes from './routes/seller.routes.js';
import orderRoutes from './routes/order.routes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import searchRoutes from './routes/search.routes.js';

// =====================
// ENV CONFIG
// =====================
dotenv.config();

// =====================
// APP INIT
// =====================
const app = express();

// =====================
// ES MODULE DIRNAME
// =====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================
// DATABASE
// =====================
connectDB();

// =====================
// MIDDLEWARE
// =====================

// CORS
app.use(
    cors({
        origin: [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',
            process.env.FRONTEND_URL
        ].filter(Boolean),
        credentials: true
    })
);

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logger
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// =====================
// HEALTH CHECK
// =====================
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        environment: process.env.NODE_ENV || 'development'
    });
});

// =====================
// ROUTES
// =====================

// Upload
app.use('/api/upload', uploadRoutes);

// Versioned APIs
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/seller', sellerRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/search', searchRoutes);

// Legacy support
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/search', searchRoutes);

// =====================
// ROOT
// =====================
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'BuilderSmart Backend API',
        version: '1.0.0',
        docs: {
            health: '/health',
            products: '/api/v1/products',
            categories: '/api/v1/categories'
        }
    });
});

// =====================
// 404 HANDLER
// =====================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// =====================
// GLOBAL ERROR HANDLER
// =====================
app.use((err, req, res, next) => {
    console.error('❌ ERROR:', err);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// =====================
// SERVER (RENDER SAFE)
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(60));
});

export default app;
