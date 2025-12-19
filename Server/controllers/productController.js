import Product from '../models/Product.model.js';

// Validation helper
const validateProductData = (data) => {
    const errors = [];

    // Required fields
    if (!data.name || !data.name.trim()) {
        errors.push('Product name is required');
    }
    if (!data.categoryId) {
        errors.push('Category is required');
    }
    if (!data.price || isNaN(parseFloat(data.price)) || parseFloat(data.price) <= 0) {
        errors.push('Valid price is required');
    }
    if (!data.description || !data.description.trim()) {
        errors.push('Description is required');
    }
    if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
        errors.push('At least one image is required');
    }

    // Validate images array
    if (data.images && Array.isArray(data.images)) {
        data.images.forEach((img, index) => {
            if (typeof img !== 'string' || !img.trim()) {
                errors.push(`Image at position ${index + 1} is invalid`);
            }
        });
    }

    return errors;
};

// Get all products
export const getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, categoryId, status, minPrice, maxPrice } = req.query;

        let filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (categoryId) filter.categoryId = categoryId;
        if (status) filter.status = status;

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // For seller, only show their products
        if (req.user && req.user.role === 'seller') {
            filter.sellerId = req.user._id;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('sellerId', 'name email'),
            Product.countDocuments(filter)
        ]);

        res.json({
            success: true,
            count: products.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            },
            products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get single product
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('sellerId', 'name email');

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
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Create product
export const createProduct = async (req, res) => {
    try {
        console.log('Creating product for user:', req.user?._id);
        console.log('Product data received:', JSON.stringify(req.body, null, 2));

        // Validate required fields
        const validationErrors = validateProductData(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Prepare product data
        const productData = {
            name: req.body.name.trim(),
            categoryId: req.body.categoryId,
            subcategoryId: req.body.subcategoryId || null,
            brand: req.body.brand?.trim() || undefined,
            description: req.body.description.trim(),
            materialType: req.body.materialType || 'other',
            grade: req.body.grade || undefined,
            color: req.body.color || undefined,
            finish: req.body.finish || undefined,
            application: req.body.application?.filter(app => app.trim()) || [],
            technicalSpecs: req.body.technicalSpecs || {},
            price: parseFloat(req.body.price),
            originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : undefined,
            images: req.body.images,
            inventory: {
                stock: parseInt(req.body.inventory?.stock) || 0,
                lowStockThreshold: parseInt(req.body.inventory?.lowStockThreshold) || 10,
                moq: parseInt(req.body.inventory?.moq) || 1,
                manageStock: req.body.inventory?.manageStock !== false,
                bulkDiscount: req.body.inventory?.bulkDiscount || false,
                bulkTiers: req.body.inventory?.bulkTiers || []
            },
            unitType: req.body.unitType || 'piece',
            packaging: req.body.packaging || {
                type: 'box',
                quantityPerPackage: 1
            },
            shipping: req.body.shipping || undefined,
            status: req.body.status || 'draft',
            certifications: req.body.certifications?.filter(c => c.trim()) || [],
            warranty: req.body.warranty || undefined,
            returnPolicy: req.body.returnPolicy || undefined,
            tags: req.body.tags?.filter(tag => tag.trim()) || [],
            seo: req.body.seo || {},
            variations: req.body.variations?.filter(v => v.name && v.options?.length > 0) || [],
            variants: req.body.variants?.map(variant => ({
                name: variant.name || req.body.name,
                sku: variant.sku || '',
                price: parseFloat(variant.price) || parseFloat(req.body.price),
                stock: parseInt(variant.stock) || 0,
                attributes: variant.attributes || {},
                image: variant.image || req.body.images?.[0] || '',
                specifications: variant.specifications || {}
            })) || [],
            sellerId: req.user._id,
            storeName: req.user.storeName || req.user.name
        };

        // Clean up undefined fields
        Object.keys(productData).forEach(key => {
            if (productData[key] === undefined) {
                delete productData[key];
            }
        });

        // Clean nested objects
        if (productData.shipping && Object.keys(productData.shipping).length === 0) {
            delete productData.shipping;
        }
        if (productData.warranty && Object.keys(productData.warranty).length === 0) {
            delete productData.warranty;
        }
        if (productData.seo && Object.keys(productData.seo).length === 0) {
            delete productData.seo;
        }

        console.log('Final product data:', JSON.stringify(productData, null, 2));

        // Create and save product
        const product = new Product(productData);
        await product.save();

        // Populate seller info
        const populatedProduct = await Product.findById(product._id)
            .populate('sellerId', 'name email');

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: populatedProduct
        });

    } catch (error) {
        console.error('Create product error:', error);

        // Handle duplicate SKU
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'SKU already exists',
                details: error.keyValue
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }

        // Handle CastError (invalid ObjectId)
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: `Invalid ${error.path}: ${error.value}`
            });
        }

        // Generic error
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check permission
        if (req.user.role !== 'admin' && product.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this product'
            });
        }

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        ).populate('sellerId', 'name email');

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct
        });
    } catch (error) {
        console.error('Update product error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }

        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update product'
        });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check permission
        if (req.user.role !== 'admin' && product.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this product'
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get seller's products
export const getSellerProducts = async (req, res) => {
    try {
        const products = await Product.find({ sellerId: req.user._id })
            .populate('sellerId', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error('Get seller products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch seller products',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Bulk update products
export const bulkUpdateProducts = async (req, res) => {
    try {
        const { productIds, updates } = req.body;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Product IDs are required'
            });
        }

        // Verify ownership for seller
        if (req.user.role === 'seller') {
            const products = await Product.find({
                _id: { $in: productIds },
                sellerId: req.user._id
            });

            if (products.length !== productIds.length) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to update some products'
                });
            }
        }

        const result = await Product.updateMany(
            { _id: { $in: productIds } },
            { $set: updates },
            { multi: true }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} products updated`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Bulk update error:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to update products',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getSellerProducts,
    bulkUpdateProducts
};