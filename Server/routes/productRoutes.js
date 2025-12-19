import express from 'express';
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getSellerProducts,
    bulkUpdateProducts
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes - all require authentication
router.use(protect);

// Seller specific routes
router.get('/seller/my-products', authorize('admin', 'seller'), getSellerProducts);
router.post('/', authorize('admin', 'seller'), createProduct);
router.put('/:id', authorize('admin', 'seller'), updateProduct);
router.delete('/:id', authorize('admin', 'seller'), deleteProduct);
router.post('/bulk-update', authorize('admin', 'seller'), bulkUpdateProducts);

export default router;