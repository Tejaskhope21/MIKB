import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getPublicProducts,
  getCategoryProducts,
  getPublicProduct,
  getProductById,
  bulkCreateProducts
} from "../controllers/productController.js";

import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

/* =========================
   seller ROUTES
========================= */
router.post("/", protect,authorize('SELLER'), createProduct);
router.post(
  "/bulk",
  protect,
  authorize("SELLER"),
  bulkCreateProducts
);
router.get("/my", protect,authorize('SELLER'), getSellerProducts);
router.put("/:id", protect, authorize('SELLER'),updateProduct);
router.delete("/:id", protect,authorize('SELLER'), deleteProduct);

/* =========================
   PUBLIC ROUTES
========================= */
router.get("/public", getPublicProducts);
router.get("/category/:categoryId", getCategoryProducts);
router.get('/category', getPublicProduct);
router.get("/:id", getProductById);





export default router;
