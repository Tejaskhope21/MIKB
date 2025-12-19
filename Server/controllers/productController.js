import Product from '../models/Product.model.js';
import mongoose from 'mongoose';

/* =========================
   CREATE PRODUCT
========================= */
export const createProduct = async (req, res) => {
    try {
        const product = await Product.create({
            ...req.body,
            sellerId: req.user._id // ✅ IMPORTANT FIX
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error('Product create error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
};


/* =========================
   GET ALL PRODUCTS
========================= */
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .sort({ createdAt: -1 })
            .populate('sellerId', 'name storeName')
            .populate('categoryId', 'name');

        res.json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products'
        });
    }
};

/* =========================
   GET SINGLE PRODUCT
========================= */
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('sellerId', 'name storeName')
            .populate('categoryId', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product'
        });
    }
};

/* =========================
   UPDATE PRODUCT
========================= */
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (
            req.user.role !== 'admin' &&
            product.sellerId.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Product updated',
            product: updated
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/* =========================
   DELETE PRODUCT
========================= */
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (
            req.user.role !== 'admin' &&
            product.sellerId.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await product.deleteOne();

        res.json({
            success: true,
            message: 'Product deleted'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete product'
        });
    }
};

/* =========================
   SELLER PRODUCTS
========================= */
export const getSellerProducts = async (req, res) => {
    try {
        const products = await Product.find({ sellerId: req.user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch seller products'
        });
    }
};

/* =========================
   BULK UPDATE
========================= */
export const bulkUpdateProducts = async (req, res) => {
    try {
        const { productIds, updates } = req.body;

        await Product.updateMany(
            { _id: { $in: productIds } },
            { $set: updates }
        );

        res.json({
            success: true,
            message: 'Products updated'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Bulk update failed'
        });
    }
};

/* =========================
   PRODUCTS BY CATEGORY
========================= */
export const getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({
            categoryId: req.params.categoryId,
            status: 'published'
        });

        res.json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category products'
        });
    }
};
