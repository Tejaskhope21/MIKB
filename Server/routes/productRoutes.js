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
    authorize('SELLER', 'ADMIN', 'SUPER_ADMIN'), // Updated to match your User schema roles
    createProduct
);

router.put(
    '/:id',
    protect,
    authorize('SELLER', 'ADMIN', 'SUPER_ADMIN'),
    updateProduct
);

router.delete(
    '/:id',
    protect,
    authorize('SELLER', 'ADMIN', 'SUPER_ADMIN'),
    deleteProduct
);

// Seller-specific routes - make sure this matches your frontend
router.get(
    '/seller/my-products',
    protect,
    authorize('SELLER', 'ADMIN', 'SUPER_ADMIN'),
    getSellerProducts
);

router.put(
    '/bulk/update',
    protect,
    authorize('SELLER', 'ADMIN', 'SUPER_ADMIN'),
    bulkUpdateProducts
);

export default router;