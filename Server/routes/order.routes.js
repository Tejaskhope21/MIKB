import express from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatusBySeller,
    getSellerOrders,
    cancelOrder,
    getOrderHistory,
    getSellerOrderDetails
} from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
// Seller routes - get orders where user is the seller
router.get('/seller', protect, authorize('SELLER'), getSellerOrders);
router.patch('/:id/status', protect, authorize('SELLER'), updateOrderStatusBySeller);
// Seller get single order
router.get('/seller/:orderId', protect, authorize('SELLER'), getSellerOrderDetails);
router.post('/orders', protect, createOrder);
router.post('/', authorize('USER'), createOrder);
router.get('/my-orders', authorize('USER'), getOrders);
router.get('/history', authorize('USER'), getOrderHistory);
router.get('/:id', authorize('USER'), getOrderById);
router.patch('/:id/cancel', authorize('USER'), cancelOrder);

// Admin/Seller routes (these will be handled in seller routes)
// router.get('/', authorize('ADMIN', 'SELLER'), getAllOrders);

export default router;