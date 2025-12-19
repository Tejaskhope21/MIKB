import express from 'express';
import {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    fixDuplicateIndex,
    checkExistingData
} from '../controllers/categoryController.js';

import {
    protect,
    authorize
} from '../middleware/auth.middleware.js';

const router = express.Router();

/* ---------- PUBLIC ROUTES ---------- */
router.get('/', getCategories);
router.get('/:id', getCategory);

/* ---------- UTILITY ROUTES (for debugging) ---------- */
router.get('/debug/check-data', checkExistingData);
router.get('/debug/fix-index', fixDuplicateIndex);

/* ---------- ADMIN PROTECTED ROUTES ---------- */
router.post(
    '/',
    protect,
    authorize('admin'),
    createCategory
);

router.put(
    '/:id',
    protect,
    authorize('admin'),
    updateCategory
);

router.delete(
    '/:id',
    protect,
    authorize('admin'),
    deleteCategory
);

export default router;