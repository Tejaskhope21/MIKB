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
    searchProducts,
    getSubcategoriesByCategory,
    getProductsBySubcategory,
    getCategoryWithSubcategories,
    getCategoryProducts,
    getSubcategoryProducts,
    getFilteredProducts

} from '../controllers/productController.js';

import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get("/products", getFilteredProducts);
router.get('/search', searchProducts);
router.get('/:id', getProduct);
router.get('/by-numeric-id/:numericId', getProductByNumericId);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/category/:categoryId/subcategories', getSubcategoriesByCategory);  //THIS  <------ 
router.get('/category/:categoryId/subcategory/:subcategory', getProductsBySubcategory); // <------THIS ROUTES CAN NOT BE USE  FETCH THE CATEGORY AND SUB CATEGORY PRODUCT 

// NEW ROUTES   THIS ROUTES ARE BE USE RECENT FETCHING SUB CATEGORY PRODUCT DATA 
router.get('/category/:categoryId/with-subcategories', getCategoryWithSubcategories);
router.get('/category/:categoryId/products', getCategoryProducts);
router.get('/category/:categoryId/subcategory/:subcategoryId/products', getSubcategoryProducts);

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