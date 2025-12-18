import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

/* ======================
   Middleware
====================== */
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ======================
   Database Connection
====================== */
connectDB();

/* ======================
   API Routes
====================== */

// Auth & User Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Admin Routes
app.use('/api/admin', adminRoutes);

// Category & Product Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

/* ======================
   Health Check
====================== */
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚀 BuilderSmart API is running smoothly!',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/* ======================
   Root Route
====================== */
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to BuilderSmart Backend API',
        version: '1.0.0'
    });
});

/* ======================
   404 Handler (Express 5 Safe)
====================== */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
});

/* ======================
   Global Error Handler
====================== */
app.use((err, req, res, next) => {
    console.error('🔥 Error:', err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate field value',
            field: Object.keys(err.keyValue)[0]
        });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

/* ======================
   Server Start
====================== */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Health check: http://localhost:${PORT}/health`);
});

// Graceful Shutdown
process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down...');
    server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down...');
    server.close(() => process.exit(0));
});