import express from 'express';
import {
 createCategoryTree,
  updateCategory,
  deleteCategory,
  getCategoriesForSeller,
  getSubCategoriesForSeller,
  getItemTypesForSeller,
  getPublicCategories
} from '../controllers/categoryController.js';
import { deleteAllCategories } from '../controllers/categoryController.js';

import { protect, authorize } from '../middleware/auth.middleware.js';
const router = express.Router();

/* ===============================
   ADMIN ROUTES
================================ */
router.post('/admin/category-tree',protect,authorize('admin'),createCategoryTree);

router.put('/admin/category/:id', protect, authorize('admin'), updateCategory);
router.delete('/admin/category/:id', protect, authorize('admin'), deleteCategory);
router.delete(
  '/admin/delete-all-categories',
  protect,
  authorize('admin'),
  deleteAllCategories
);

/* ===============================
   SELLER ROUTES
================================ */
router.get('/seller/categories', getCategoriesForSeller);
router.get('/seller/subcategories/:categoryId', getSubCategoriesForSeller);
router.get('/seller/itemtypes/:subCategoryId', getItemTypesForSeller);

/* ===============================
   PUBLIC ROUTES
================================ */
router.get('/public/categories', getPublicCategories);

export default router;