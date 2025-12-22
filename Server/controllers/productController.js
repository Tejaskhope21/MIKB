import Product from '../models/Product.model.js';
import mongoose from 'mongoose';

/* =========================
   CREATE PRODUCT
========================= */
export const createProduct = async (req, res) => {
    try {
        console.log('Creating product with data:', req.body);
        console.log('User ID:', req.user._id);

        const product = await Product.create({
            ...req.body,
            sellerId: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Product create error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Product with this numeric ID already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
};

/* =========================
   GET SELLER PRODUCTS
========================= */
export const getSellerProducts = async (req, res) => {
    try {
        const sellerId = req.user._id;

        const {
            status,
            page = 1,
            limit = 20,
            search,
            sort = '-createdAt'
        } = req.query;

        const filter = { sellerId };

        // Apply filters
        if (status) filter.status = status;

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .populate('categoryId', 'name title')
                .populate('subcategoryId', 'name title'),
            Product.countDocuments(filter)
        ]);

        res.json({
            success: true,
            products,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get seller products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch seller products',
            error: error.message
        });
    }
};

/* =========================
   GET ALL PRODUCTS
========================= */
export const getProducts = async (req, res) => {
    try {
        const {
            categoryId,
            sellerId,
            status = 'published',
            page = 1,
            limit = 20,
            search,
            minPrice,
            maxPrice,
            materialType
        } = req.query;

        const filter = {};

        // Apply filters
        if (status) {
            filter.status = status;
        }

        if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
            filter.categoryId = categoryId;
        }

        if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) {
            filter.sellerId = sellerId;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ];
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        if (materialType) {
            filter.materialType = materialType;
        }

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate('sellerId', 'name businessName')
                .populate('categoryId', 'name title')
                .populate('subcategoryId', 'name title'),
            Product.countDocuments(filter)
        ]);

        res.json({
            success: true,
            products,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

/* =========================
   GET SINGLE PRODUCT
========================= */
export const getProduct = async (req, res) => {
    try {
        const id = req.params.id;
        let product;

        // Check if it's a MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id)) {
            product = await Product.findById(id)
                .populate('sellerId', 'name businessName')
                .populate('categoryId', 'name title')
                .populate('subcategoryId', 'name title');
        } else {
            // Try numericId
            const numericId = parseInt(id);
            if (!isNaN(numericId)) {
                product = await Product.findOne({ numericId })
                    .populate('sellerId', 'name businessName')
                    .populate('categoryId', 'name title')
                    .populate('subcategoryId', 'name title');
            }
        }

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
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
};

/* =========================
   UPDATE PRODUCT
========================= */
export const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        let product;

        // Find product
        if (mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id)) {
            product = await Product.findById(id);
        } else {
            const numericId = parseInt(id);
            if (!isNaN(numericId)) {
                product = await Product.findOne({ numericId });
            }
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check authorization - seller can only update their own products
        if (req.user.role === 'SELLER' && product.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this product'
            });
        }

        // Update the product
        const updated = await Product.findByIdAndUpdate(
            product._id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: updated
        });

    } catch (error) {
        console.error('Update product error:', error);

        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
};

/* =========================
   DELETE PRODUCT
========================= */
export const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        let product;

        // Find product
        if (mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id)) {
            product = await Product.findById(id);
        } else {
            const numericId = parseInt(id);
            if (!isNaN(numericId)) {
                product = await Product.findOne({ numericId });
            }
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check authorization - seller can only delete their own products
        if (req.user.role === 'SELLER' && product.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this product'
            });
        }

        await product.deleteOne();

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
};

/* =========================
   BULK UPDATE PRODUCTS
========================= */
export const bulkUpdateProducts = async (req, res) => {
    try {
        const { productIds, updates } = req.body;
        const sellerId = req.user._id;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Product IDs are required'
            });
        }

        const result = await Product.updateMany(
            {
                _id: { $in: productIds },
                sellerId
            },
            { $set: updates }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} products updated`,
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error('Bulk update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update products',
            error: error.message
        });
    }
};

/* =========================
   SEARCH PRODUCTS
========================= */
export const searchProducts = async (req, res) => {
    try {
        const {
            query,
            categoryId,
            minPrice,
            maxPrice,
            materialType,
            sellerId,
            page = 1,
            limit = 20,
            sort = '-createdAt'
        } = req.query;

        const filter = { status: 'published' };

        // Text search
        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } },
                { grade: { $regex: query, $options: 'i' } },
                { color: { $regex: query, $options: 'i' } },
                { finish: { $regex: query, $options: 'i' } }
            ];
        }

        // Category filter
        if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
            filter.categoryId = categoryId;
        }

        // Price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        // Material type filter
        if (materialType) {
            filter.materialType = materialType;
        }

        // Seller filter
        if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) {
            filter.sellerId = sellerId;
        }

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('sellerId', 'name businessName')
                .populate('categoryId', 'name title')
                .populate('subcategoryId', 'name title')
                .sort(sort)
                .skip(skip)
                .limit(Number(limit)),
            Product.countDocuments(filter)
        ]);

        res.json({
            success: true,
            products,
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search products',
            error: error.message
        });
    }
};

/* =========================
   GET PRODUCTS BY CATEGORY
========================= */
export const getProductsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        const products = await Product.find({
            categoryId,
            status: 'published'
        })
            .populate('sellerId', 'name businessName')
            .populate('categoryId', 'name title')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        console.error('Products by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category products',
            error: error.message
        });
    }
};

/* =========================
   GET PRODUCT BY NUMERIC ID
========================= */
export const getProductByNumericId = async (req, res) => {
    try {
        const numericId = parseInt(req.params.numericId);

        if (isNaN(numericId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid numeric ID'
            });
        }

        const product = await Product.findOne({ numericId })
            .populate('sellerId', 'name businessName')
            .populate('categoryId', 'name title')
            .populate('subcategoryId', 'name title');

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
        console.error('Get product by numeric ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
};