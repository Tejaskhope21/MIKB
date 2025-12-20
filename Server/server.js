// server.js (or index.js / app.js)
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
import userRoutes from './routes/user.routes.js';        // <-- IMPORTANT
import adminRoutes from './routes/admin.routes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import sellerRoutes from './routes/seller.routes.js';
import orderRoutes from './routes/order.routes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import searchRoutes from './routes/search.routes.js';

// ENV
dotenv.config();

const app = express();

// ES MODULE FIX
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB
connectDB();

// MIDDLEWARE
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'https://bricksitnow.netlify.app',
        'https://bricks-com.vercel.app',
        'https://bricksitnow.co.in',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


// ---------- CORS ----------
app.use(
    cors({
        origin: [
            // Local
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',

            // Production Frontends
            'https://bricksitnow.netlify.app',
            'https://bricks-com.vercel.app',
            'https://bricksitnow.co.in',

            // Optional ENV
            process.env.FRONTEND_URL
        ].filter(Boolean),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
);

// ---------- Body Parsers ----------
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// HEALTH
app.get('/health', (req, res) => {
    res.json({ success: true, status: 'OK' });
});

app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'OK' });
});

// UPLOAD ROUTES
app.use('/api/upload', uploadRoutes);

// USER ROUTES - MOUNTED CORRECTLY
app.use('/api/user', userRoutes);           // e.g., /api/user/addresses
app.use('/api/users', userRoutes);          // fallback
app.use('/api/v1/user', userRoutes);        // versioned: /api/v1/user/addresses
app.use('/api/v1/users', userRoutes);

// OTHER ROUTES
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/seller', sellerRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/search', searchRoutes);

// LEGACY ROUTES (keep for compatibility)
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/search', searchRoutes);

// ROOT ENDPOINT - Now shows user routes so you can verify
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'BuilderSmart Backend API',
        version: '1.0.0',
        docs: {
            health: '/health',
            auth: '/api/auth OR /api/v1/auth',
            user_profile: '/api/user/profile OR /api/v1/user/profile',
            user_addresses: '/api/user/addresses OR /api/v1/user/addresses',
            products: '/api/v1/products',
            categories: '/api/v1/categories'
        }
    });
});

app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'API Root',
        endpoints: {
            user: '/api/user/profile , /api/user/addresses',
            auth: '/api/auth'
        }
    });
});

// 404 HANDLER
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// ERROR HANDLER
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`User endpoints:`);
    console.log(`   GET  /api/user/profile`);
    console.log(`   GET  /api/user/addresses`);
    console.log(`   POST /api/user/addresses`);
    console.log(`   DELETE /api/user/addresses/:id`);
});