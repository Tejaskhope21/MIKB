import express from 'express';
import {
    getSellerDashboard,
    getSellerProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkUpdateProducts,
    updateInventory,
    bulkUpdateInventory,
    getSellerOrders,
    updateOrderStatus,
    getSellerPayouts,
    requestPayout,
    updateSellerProfile,
    getSellerAnalytics,
    getSellerSettings,
    updateSellerSettings,
    toggleStorePublish,
    getLowStockAlerts,
    exportProducts
} from '../controllers/seller.controller.js';
import { protect, authorize, checkActive } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// All routes require SELLER authentication
router.use(protect);
router.use(checkActive);
router.use(authorize('SELLER'));

/* ================= DASHBOARD ================= */
router.get('/dashboard', getSellerDashboard);
router.get('/analytics', getSellerAnalytics);

/* ================= PRODUCT MANAGEMENT ================= */
router.get('/products', getSellerProducts);
router.post('/products', upload.array('images', 10), createProduct);
router.put('/products/:productId', upload.array('images', 10), updateProduct);
router.delete('/products/:productId', deleteProduct);
router.post('/products/bulk-status', bulkUpdateProducts);
router.put('/products/:productId/inventory', updateInventory);
router.post('/products/bulk-inventory', bulkUpdateInventory);
router.get('/products/export', exportProducts);
router.get('/products/low-stock', getLowStockAlerts);

/* ================= ORDER MANAGEMENT ================= */
router.get('/orders', getSellerOrders);
router.put('/orders/:orderId/items/:itemId/status', updateOrderStatus);

/* ================= PAYOUT MANAGEMENT ================= */
router.get('/payouts', getSellerPayouts);
router.post('/payouts/request', requestPayout);

/* ================= PROFILE & SETTINGS ================= */
router.put('/profile', upload.fields([
    { name: 'panCard', maxCount: 1 },
    { name: 'aadharCard', maxCount: 1 },
    { name: 'gstCertificate', maxCount: 1 }
]), updateSellerProfile);

router.get('/settings', getSellerSettings);
router.put('/settings', updateSellerSettings);
router.patch('/store/publish', toggleStorePublish);

export default router;