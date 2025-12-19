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
import uploadRoutes from './routes/uploadroutes.js';

// Load env
dotenv.config();

const app = express();

// ES module dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ======================
   Database
====================== */
connectDB();

/* ======================
   CORS
====================== */
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
}));

/* ======================
   Security Headers
====================== */
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

/* ======================
   Logging
====================== */
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

/* ======================
   Body Parsers
====================== */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* ======================
   Request Logger (DEV)
====================== */
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
        next();
    });
}

/* ======================
   Health
====================== */
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        environment: process.env.NODE_ENV || 'development',
    });
});

/* ======================
   Routes
====================== */

// Cloudinary uploads
app.use('/api/upload', uploadRoutes);

// Versioned APIs
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/seller', sellerRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);

// Legacy support
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

/* ======================
   Root
====================== */
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'BuilderSmart Backend API',
        version: '1.0.0',
        endpoints: {
            upload: '/api/upload',
            products: '/api/v1/products',
            categories: '/api/v1/categories',
            health: '/health',
        },
    });
});

/* ======================
   404 Handler
====================== */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

/* ======================
   Global Error Handler
====================== */
app.use((err, req, res, next) => {
    console.error('Global Error:', err);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

/* ======================
   Server
====================== */
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
    console.log('\n' + '='.repeat(60));
    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
    console.log('='.repeat(60));
});

export default app;
