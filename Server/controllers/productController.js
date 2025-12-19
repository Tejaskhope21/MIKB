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
        // Extract query parameters
        const { categoryId, limit, exclude } = req.query;

        // Build filter object
        const filter = {};

        if (categoryId) {
            // Check if it's an ObjectId or numericId for category
            if (mongoose.Types.ObjectId.isValid(categoryId)) {
                filter.categoryId = categoryId;
            } else {
                // Try to find category by numericId and then use its _id
                // For now, just filter by categoryId as string
                filter.categoryId = categoryId;
            }
        }

        // Apply status filter if not provided in query
        if (!req.query.status) {
            filter.status = 'published';
        }

        let query = Product.find(filter)
            .sort({ createdAt: -1 })
            .populate('sellerId', 'name storeName')
            .populate('categoryId', 'name color icon');

        // Apply limit if provided
        if (limit && !isNaN(parseInt(limit))) {
            query = query.limit(parseInt(limit));
        }

        // Exclude specific product if provided
        if (exclude) {
            if (mongoose.Types.ObjectId.isValid(exclude)) {
                query = query.where('_id').ne(exclude);
            } else {
                query = query.where('numericId').ne(parseInt(exclude));
            }
        }

        const products = await query;

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error('Get products error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

/* =========================
   GET SINGLE PRODUCT (FIXED - Handles both _id and numericId)
========================= */
export const getProduct = async (req, res) => {
    try {
        const id = req.params.id;
        let product;

        // Check if it's a MongoDB ObjectId (24 hex characters)
        if (mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id)) {
            // It's an ObjectId - find by _id
            product = await Product.findById(id)
                .populate('sellerId', 'name storeName')
                .populate('categoryId', 'name color icon description');
        } else {
            // It's a numericId - find by numericId
            const numericId = parseInt(id);

            if (isNaN(numericId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID. Must be a valid ObjectId or numeric ID.'
                });
            }

            product = await Product.findOne({ numericId: numericId })
                .populate('sellerId', 'name storeName')
                .populate('categoryId', 'name color icon description');
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
        console.error('Get product error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
};

/* =========================
   GET PRODUCT BY NUMERIC ID (Additional endpoint)
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
            .populate('sellerId', 'name storeName')
            .populate('categoryId', 'name color icon description');

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
            message: 'Failed to fetch product by numeric ID'
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

        // Find product by either _id or numericId
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

        // Authorization check
        if (req.user.role !== 'admin' && product.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
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
        const id = req.params.id;
        let product;

        // Find product by either _id or numericId
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

        if (req.user.role !== 'admin' && product.sellerId.toString() !== req.user._id.toString()) {
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
            .sort({ createdAt: -1 })
            .populate('categoryId', 'name');

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
        const categoryId = req.params.categoryId;
        let filter = { status: 'published' };

        // Check if categoryId is ObjectId or numericId
        if (mongoose.Types.ObjectId.isValid(categoryId) && /^[0-9a-fA-F]{24}$/.test(categoryId)) {
            filter.categoryId = categoryId;
        } else {
            // Try to find category by numericId
            filter['categoryId.numericId'] = parseInt(categoryId);
        }

        const products = await Product.find(filter)
            .populate('categoryId', 'name');

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error('Products by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category products'
        });
    }
};

/* =========================
   SEARCH PRODUCTS
========================= */
export const searchProducts = async (req, res) => {
    try {
        const { query, category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

        const searchFilter = { status: 'published' };

        // Text search
        if (query) {
            searchFilter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } }
            ];
        }

        // Category filter
        if (category) {
            if (mongoose.Types.ObjectId.isValid(category)) {
                searchFilter.categoryId = category;
            } else {
                searchFilter['categoryId.numericId'] = parseInt(category);
            }
        }

        // Price range filter
        if (minPrice || maxPrice) {
            searchFilter.price = {};
            if (minPrice) searchFilter.price.$gte = parseFloat(minPrice);
            if (maxPrice) searchFilter.price.$lte = parseFloat(maxPrice);
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const products = await Product.find(searchFilter)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('categoryId', 'name')
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(searchFilter);

        res.json({
            success: true,
            count: products.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            products
        });
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search products'
        });
    }
};