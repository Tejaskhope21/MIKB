import express from 'express';
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';

import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected
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

export default router;
