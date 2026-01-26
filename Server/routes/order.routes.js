import express from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatusBySeller,
    getSellerOrders,
    cancelOrder,
    getOrderHistory,
    getSellerOrderDetails,
    verifyPaymentProof,
    getSellerPaymentDetails,
    getOrderCount,
    getOrderSummary
} from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// User routes (protected)
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getOrders);
router.get('/history', protect, getOrderHistory);
router.get('/count', protect, getOrderCount);
router.get('/summary', protect, getOrderSummary);
router.get('/:id', protect, getOrderById);
router.patch('/:id/cancel', protect, cancelOrder);

// Seller routes (require seller authorization)
router.get('/seller/orders', protect, authorize('SELLER'), getSellerOrders);
router.get('/seller/:orderId', protect, authorize('SELLER'), getSellerOrderDetails);
router.patch('/:id/status', protect, authorize('SELLER'), updateOrderStatusBySeller);
router.post('/:orderId/verify-payment', protect, authorize('SELLER'), verifyPaymentProof);
router.get('/seller/:orderId/payment', protect, authorize('SELLER'), getSellerPaymentDetails);

export default router;