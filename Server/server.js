import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Load environment variables
dotenv.config();

const app = express();

/* ======================
   Middleware
====================== */
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   Database Connection
====================== */
connectDB();

/* ======================
   API Routes
====================== */
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

/* ======================
   Health Check
====================== */
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚀 Server is running'
    });
});

/* ======================
   404 Handler (EXPRESS v5 SAFE)
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

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

/* ======================
   Server Start
====================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
