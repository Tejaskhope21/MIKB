import express from 'express';
import {
    getProducts,
    getProduct,
    getProductByNumericId,
    createProduct,
    updateProduct,
    deleteProduct,
    getSellerProducts,
    bulkUpdateProducts,
    getProductsByCategory,
    searchProducts
} from '../controllers/productController.js';

import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProduct);
router.get('/by-numeric-id/:numericId', getProductByNumericId);
router.get('/category/:categoryId', getProductsByCategory);

// Protected routes
router.post(
    '/',
    protect,
    authorize('seller', 'admin'),
    createProduct
);

router.put(
    '/:id',
    protect,
    authorize('seller', 'admin'),
    updateProduct
);

router.delete(
    '/:id',
    protect,
    authorize('seller', 'admin'),
    deleteProduct
);

// Seller-specific routes
router.get(
    '/seller/my-products',
    protect,
    authorize('seller', 'admin'),
    getSellerProducts
);

router.put(
    '/bulk/update',
    protect,
    authorize('seller', 'admin'),
    bulkUpdateProducts
);

export default router;