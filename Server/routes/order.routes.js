import express from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getOrderHistory
} from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.post('/orders', protect, createOrder);
router.post('/', authorize('USER'), createOrder);
router.get('/my-orders', authorize('USER'), getOrders);
router.get('/history', authorize('USER'), getOrderHistory);
router.get('/:id', authorize('USER'), getOrderById);
router.patch('/:id/cancel', authorize('USER'), cancelOrder);

// Admin/Seller routes (these will be handled in seller routes)
// router.get('/', authorize('ADMIN', 'SELLER'), getAllOrders);

export default router;