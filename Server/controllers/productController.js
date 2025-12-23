import { body } from 'express-validator';
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
/* =========================
   PRODUCTS BY SUBCATEGORY
========================= */

export const getProductsBySubcategory = async (req, res) => {
    try {
        const { categoryId, subcategoryId } = req.params;
        
        console.log('📦 Fetching products for:', { 
            categoryId, 
            subcategoryId 
        });

        // Check if subcategoryId is provided
        if (!subcategoryId) {
            // If no subcategoryId, return ALL products for category
            const products = await Product.find({
                status: 'published',
                categoryId: categoryId
            })
            .populate('sellerId', 'name storeName rating')
            .populate('categoryId', 'name color icon');
            
            return res.json({
                success: true,
                count: products.length,
                products
            });
        }

        // Handle different types of subcategoryId
        let subcategoryFilter = {};
        
        // Try as direct string match first (most likely case)
        const directMatchProducts = await Product.find({
            status: 'published',
            categoryId: categoryId,
            subcategoryId: subcategoryId // Direct string match
        })
        .populate('sellerId', 'name storeName rating')
        .populate('categoryId', 'name color icon');
        
        if (directMatchProducts.length > 0) {
            console.log(`✅ Found ${directMatchProducts.length} products with direct subcategoryId match`);
            return res.json({
                success: true,
                count: directMatchProducts.length,
                products: directMatchProducts,
                matchedBy: 'direct subcategoryId match'
            });
        }
        
        // If no direct match, try to find by subcategory.id
        const subIdMatchProducts = await Product.find({
            status: 'published',
            categoryId: categoryId,
            'subcategory.id': subcategoryId
        })
        .populate('sellerId', 'name storeName rating')
        .populate('categoryId', 'name color icon');
        
        if (subIdMatchProducts.length > 0) {
            console.log(`✅ Found ${subIdMatchProducts.length} products with subcategory.id match`);
            return res.json({
                success: true,
                count: subIdMatchProducts.length,
                products: subIdMatchProducts,
                matchedBy: 'subcategory.id match'
            });
        }
        
        // Try numericId match
        const numericId = parseInt(subcategoryId);
        if (!isNaN(numericId)) {
            const numericMatchProducts = await Product.find({
                status: 'published',
                categoryId: categoryId,
                'subcategory.numericId': numericId
            })
            .populate('sellerId', 'name storeName rating')
            .populate('categoryId', 'name color icon');
            
            if (numericMatchProducts.length > 0) {
                console.log(`✅ Found ${numericMatchProducts.length} products with subcategory.numericId match`);
                return res.json({
                    success: true,
                    count: numericMatchProducts.length,
                    products: numericMatchProducts,
                    matchedBy: 'subcategory.numericId match'
                });
            }
        }

        // If nothing found, return empty
        console.log(`❌ No products found for subcategory: ${subcategoryId}`);
        return res.json({
            success: true,
            count: 0,
            products: [],
            message: 'No products found for this subcategory'
        });

    } catch (error) {
        console.error('❌ Error fetching subcategory products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subcategory products',
            error: error.message
        });
    }
};
/* =========================
   GET SUBCATEGORIES FOR CATEGORY
========================= */
// In your productController.js - Add this function
export const getSubcategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        console.log('📋 Fetching subcategories for category ID:', categoryId);

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Category ID is required'
            });
        }

        // Get category first - handle both ObjectId and numericId
        const Category = mongoose.model('Category');
        let category;
        
        if (mongoose.Types.ObjectId.isValid(categoryId)) {
            // It's an ObjectId (like "69459e5f494ddc4703a6dad2")
            category = await Category.findById(categoryId);
        } else {
            // It's a numeric ID (like "700")
            category = await Category.findOne({ numericId: parseInt(categoryId) });
        }
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: `Category not found for ID: ${categoryId}`
            });
        }

        console.log('✅ Found category:', {
            name: category.name,
            _id: category._id,
            numericId: category.numericId,
            foundBy: mongoose.Types.ObjectId.isValid(categoryId) ? 'ObjectId' : 'numericId'
        });

        // Check if category has subcategories array
        if (!category.subcategories || !Array.isArray(category.subcategories) || category.subcategories.length === 0) {
            return res.json({
                success: true,
                count: 0,
                subcategories: [],
                categoryId,
                categoryNumericId: category.numericId,
                categoryName: category.name,
                message: 'No subcategories defined for this category'
            });
        }

        console.log(`📊 Found ${category.subcategories.length} subcategories in category data`);

        // Get product counts for each subcategory
        const subcategoriesWithCounts = await Promise.all(
            category.subcategories.map(async (subcat) => {
                try {
                    // Count products in this subcategory
                    // Use the category's _id for filtering products
                    const productCount = await Product.countDocuments({
                        status: 'published',
                        categoryId: category._id, // Use the actual category ObjectId
                        subcategoryId: subcat._id // Use the subcategory ObjectId
                    });
                    
                    console.log(`   📦 ${subcat.title} (${subcat._id}): ${productCount} products`);
                    
                    return {
                        _id: subcat._id,
                        id: subcat._id,
                        title: subcat.title || subcat.name || 'Untitled Subcategory',
                        numericId: subcat.numericId,
                        items: subcat.items || [],
                        productCount: productCount,
                        count: productCount,
                        hasProducts: productCount > 0
                    };
                } catch (err) {
                    console.error(`❌ Error counting products for subcategory ${subcat._id}:`, err);
                    return {
                        _id: subcat._id,
                        id: subcat._id,
                        title: subcat.title || subcat.name || 'Untitled Subcategory',
                        numericId: subcat.numericId,
                        items: subcat.items || [],
                        productCount: 0,
                        count: 0,
                        hasProducts: false
                    };
                }
            })
        );
        
        // Filter out subcategories without title
        const validSubcategories = subcategoriesWithCounts.filter(sub => 
            sub.title && sub.title !== 'Untitled Subcategory'
        );
        
        // Sort by product count (descending) then by title
        validSubcategories.sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            return a.title.localeCompare(b.title);
        });
        
        const totalProducts = validSubcategories.reduce((sum, sub) => sum + sub.count, 0);
        
        console.log(`✅ Found ${validSubcategories.length} valid subcategories with ${totalProducts} total products`);

        res.json({
            success: true,
            count: validSubcategories.length,
            subcategories: validSubcategories,
            categoryId: category._id,
            categoryNumericId: category.numericId,
            categoryName: category.name,
            totalProducts: totalProducts,
            requestId: categoryId, // The ID that was requested
            foundBy: mongoose.Types.ObjectId.isValid(categoryId) ? 'ObjectId' : 'numericId'
        });

    } catch (error) {
        console.error('❌ Error fetching subcategories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subcategories',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
/* =========================
   GET SUBCATEGORY BY ID (SIMPLE VERSION)
========================= */
export const getSubcategoryId = async (req, res) => {
    try {
        const { categoryId, subcategoryId } = req.query;
        
        console.log('🔍 Looking for subcategory ID:', { categoryId, subcategoryId });
        
        if (!categoryId || !subcategoryId) {
            return res.status(400).json({ 
                error: 'Missing categoryId or subcategoryId in query parameters' 
            });
        }
        
        const Category = mongoose.model('Category');
        
        // Find category by ID or numericId
        let category;
        if (mongoose.Types.ObjectId.isValid(categoryId)) {
            // If it's a valid ObjectId
            category = await Category.findById(categoryId);
        } else {
            // Try as numericId
            const numericId = parseInt(categoryId);
            if (!isNaN(numericId)) {
                category = await Category.findOne({ numericId: numericId });
            }
        }
        
        if (!category) {
            return res.status(404).json({ 
                error: `Category not found for ID: ${categoryId}` 
            });
        }
        
        console.log(`✅ Found category: ${category.name} with ${category.subcategories?.length || 0} subcategories`);
        
        // Look for subcategory by different methods
        let subcategory;
        
        // Method 1: Direct ObjectId match
        if (mongoose.Types.ObjectId.isValid(subcategoryId)) {
            subcategory = category.subcategories.find(s => 
                s._id && s._id.toString() === subcategoryId
            );
            console.log(`Method 1 (ObjectId): ${subcategory ? 'Found' : 'Not found'}`);
        }
        
        // Method 2: Numeric ID match
        if (!subcategory) {
            const numericId = parseInt(subcategoryId);
            if (!isNaN(numericId)) {
                subcategory = category.subcategories.find(s => 
                    s.numericId === numericId
                );
                console.log(`Method 2 (numericId ${numericId}): ${subcategory ? 'Found' : 'Not found'}`);
            }
        }
        
        // Method 3: Title/name match
        if (!subcategory) {
            subcategory = category.subcategories.find(s => 
                (s.title && s.title.toLowerCase() === subcategoryId.toLowerCase()) ||
                (s.name && s.name.toLowerCase() === subcategoryId.toLowerCase())
            );
            console.log(`Method 3 (title/name): ${subcategory ? 'Found' : 'Not found'}`);
        }
        
        // Method 4: String ID match
        if (!subcategory) {
            subcategory = category.subcategories.find(s => 
                s.id && s.id.toString() === subcategoryId
            );
            console.log(`Method 4 (string id): ${subcategory ? 'Found' : 'Not found'}`);
        }
        
        if (!subcategory) {
            // Return available subcategories for debugging
            const availableSubs = category.subcategories.map(s => ({
                _id: s._id,
                numericId: s.numericId,
                title: s.title || s.name,
                id: s.id || 'no id'
            }));
            
            return res.status(404).json({
                error: `Subcategory not found for ID: ${subcategoryId}`,
                availableSubcategories: availableSubs,
                searchDetails: {
                    searchedValue: subcategoryId,
                    isObjectId: mongoose.Types.ObjectId.isValid(subcategoryId),
                    isNumeric: !isNaN(parseInt(subcategoryId))
                }
            });
        }
        
        // Return JUST the subcategory ID information
        res.json({
            success: true,
            subcategoryId: subcategory._id, // The actual ObjectId
            numericId: subcategory.numericId,
            id: subcategory.id || subcategory._id,
            title: subcategory.title || subcategory.name,
            foundBy: 'ObjectId match'
        });
        
    } catch (error) {
        console.error('❌ Error in getSubcategoryId:', error);
        res.status(500).json({ 
            error: 'Failed to get subcategory ID',
            details: error.message 
        });
    }
};

/* =========================
   NEW: GET CATEGORY WITH SUBCATEGORIES AND PRODUCTS
========================= */
export const getCategoryWithSubcategories = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { selectedSubcategory, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', search = '' } = req.query;
        
        console.log('🔄 Fetching category with subcategories:', { 
            categoryId, 
            selectedSubcategory,
            page, 
            limit 
        });

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Category ID is required'
            });
        }

        const Category = mongoose.model('Category');
        let category;
        
        // Find category by ID or numericId
        if (mongoose.Types.ObjectId.isValid(categoryId)) {
            category = await Category.findById(categoryId);
        } else {
            category = await Category.findOne({ numericId: parseInt(categoryId) });
        }
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        console.log('✅ Found category:', category.name);

        // Prepare base filter
        const baseFilter = {
            status: 'published',
            categoryId: category._id
        };

        // Add subcategory filter if selected
        let subcategoryFilter = {};
        if (selectedSubcategory && selectedSubcategory !== 'all') {
            subcategoryFilter.subcategoryId = selectedSubcategory;
        }

        // Add search filter if provided
        let searchFilter = {};
        if (search.trim()) {
            searchFilter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ];
        }

        // Combine filters
        const filter = {
            ...baseFilter,
            ...subcategoryFilter,
            ...searchFilter
        };

        console.log('🔍 Filter:', filter);

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get products with pagination and sorting
        const products = await Product.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .populate('sellerId', 'name storeName rating')
            .populate('categoryId', 'name color icon');

        // Get total count
        const total = await Product.countDocuments(filter);

        // Get all subcategories with product counts
        let subcategories = [];
        if (category.subcategories && Array.isArray(category.subcategories)) {
            subcategories = await Promise.all(
                category.subcategories.map(async (subcat) => {
                    const productCount = await Product.countDocuments({
                        ...baseFilter,
                        subcategoryId: subcat._id
                    });
                    
                    return {
                        _id: subcat._id,
                        id: subcat._id,
                        title: subcat.title || subcat.name || 'Untitled Subcategory',
                        numericId: subcat.numericId,
                        items: subcat.items || [],
                        count: productCount,
                        productCount: productCount,
                        isActive: subcat.isActive !== false
                    };
                })
            );

            // Filter out empty subcategories
            subcategories = subcategories.filter(sub => sub.count > 0 && sub.isActive);
            
            // Sort by product count (descending)
            subcategories.sort((a, b) => b.count - a.count);
        }

        // Calculate category stats
        const categoryStats = {
            totalProducts: await Product.countDocuments(baseFilter),
            totalSubcategories: subcategories.length,
            activeSubcategories: subcategories.filter(sub => sub.isActive).length
        };

        // Get current subcategory info if selected
        let currentSubcategory = null;
        if (selectedSubcategory && selectedSubcategory !== 'all') {
            currentSubcategory = subcategories.find(sub => 
                sub._id.toString() === selectedSubcategory || 
                sub.numericId?.toString() === selectedSubcategory
            );
        }

        // Response
        res.json({
            success: true,
            category: {
                _id: category._id,
                name: category.name,
                title: category.title,
                numericId: category.numericId,
                description: category.description,
                icon: category.icon,
                color: category.color,
                stats: categoryStats
            },
            subcategories: subcategories,
            currentSubcategory: currentSubcategory,
            products: {
                items: products,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                },
                filters: {
                    selectedSubcategory: selectedSubcategory || 'all',
                    search,
                    sortBy,
                    sortOrder
                }
            },
            summary: {
                showing: products.length,
                total: total,
                subcategoryCount: subcategories.length,
                message: selectedSubcategory && selectedSubcategory !== 'all' 
                    ? `Showing ${products.length} products from selected subcategory`
                    : `Showing ${products.length} products from all subcategories`
            }
        });

    } catch (error) {
        console.error('❌ Error in getCategoryWithSubcategories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category data',
            error: error.message
        });
    }
};
/* =========================
   NEW: GET CATEGORY PRODUCTS WITH SUBCATEGORY FILTER
========================= */
export const getCategoryProducts = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { 
            subcategoryId, 
            page = 1, 
            limit = 20, 
            sortBy = 'createdAt', 
            sortOrder = 'desc',
            minPrice,
            maxPrice,
            materialType,
            search 
        } = req.query;
        
        console.log('🛒 Fetching category products:', { 
            categoryId, 
            subcategoryId,
            page, 
            limit,
            search 
        });

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Category ID is required'
            });
        }

        // Prepare filter
        const filter = {
            status: 'published'
        };

        // Add category filter
        if (mongoose.Types.ObjectId.isValid(categoryId)) {
            filter.categoryId = categoryId;
        } else {
            // Try to find category first
            const Category = mongoose.model('Category');
            const category = await Category.findOne({ numericId: parseInt(categoryId) });
            if (category) {
                filter.categoryId = category._id;
            } else {
                filter.categoryId = categoryId;
            }
        }

        // Add subcategory filter if provided
        if (subcategoryId && subcategoryId !== 'all') {
            filter.subcategoryId = subcategoryId;
        }

        // Add price filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        // Add material type filter
        if (materialType && materialType !== 'all') {
            filter.materialType = materialType;
        }

        // Add search filter
        if (search && search.trim()) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { materialType: { $regex: search, $options: 'i' } }
            ];
        }

        console.log('🔍 Final filter:', filter);

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get products
        const products = await Product.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .populate('sellerId', 'name storeName rating')
            .populate('categoryId', 'name color icon');

        // Get total count
        const total = await Product.countDocuments(filter);

        // Get subcategories for this category
        const Category = mongoose.model('Category');
        const category = await Category.findById(filter.categoryId);
        let subcategories = [];
        
        if (category && category.subcategories) {
            subcategories = await Promise.all(
                category.subcategories.map(async (subcat) => {
                    const count = await Product.countDocuments({
                        ...filter,
                        subcategoryId: subcat._id
                    });
                    
                    return {
                        _id: subcat._id,
                        title: subcat.title || subcat.name,
                        numericId: subcat.numericId,
                        count,
                        isActive: count > 0
                    };
                })
            );
            
            // Filter out subcategories with no products
            subcategories = subcategories.filter(sub => sub.count > 0);
        }

        // Get available material types
        const materialTypes = await Product.distinct('materialType', {
            ...filter,
            materialType: { $exists: true, $ne: '' }
        });

        // Get price range
        const priceStats = await Product.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    avgPrice: { $avg: '$price' }
                }
            }
        ]);

        // Response
        res.json({
            success: true,
            categoryId: filter.categoryId,
            filters: {
                selectedSubcategory: subcategoryId || 'all',
                selectedMaterialType: materialType || 'all',
                priceRange: {
                    min: priceStats[0]?.minPrice || 0,
                    max: priceStats[0]?.maxPrice || 0,
                    avg: priceStats[0]?.avgPrice || 0
                },
                search: search || '',
                sortBy,
                sortOrder
            },
            availableFilters: {
                subcategories: subcategories,
                materialTypes: materialTypes,
                priceRange: {
                    min: priceStats[0]?.minPrice || 0,
                    max: priceStats[0]?.maxPrice || 0
                }
            },
            products: {
                items: products,
                count: products.length,
                total,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            },
            summary: {
                showing: `${products.length} of ${total} products`,
                subcategory: subcategoryId && subcategoryId !== 'all' 
                    ? `Filtered by subcategory`
                    : 'Showing all subcategories'
            }
        });

    } catch (error) {
        console.error('❌ Error in getCategoryProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category products',
            error: error.message
        });
    }
};
/* =========================
   NEW: GET SUBCATEGORY PRODUCTS (SIMPLIFIED)
========================= */
export const getSubcategoryProducts = async (req, res) => {
    try {
        const { categoryId, subcategoryId } = req.params;
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        console.log('📦 Fetching subcategory products:', { 
            categoryId, 
            subcategoryId,
            page, 
            limit 
        });

        if (!categoryId || !subcategoryId) {
            return res.status(400).json({
                success: false,
                message: 'Category ID and Subcategory ID are required'
            });
        }

        // Prepare filter
        const filter = {
            status: 'published',
            categoryId: categoryId,
            subcategoryId: subcategoryId // Direct string match
        };

        console.log('🔍 Filter:', filter);

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get products
        const products = await Product.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .populate('sellerId', 'name storeName rating')
            .populate('categoryId', 'name color icon');

        // Get total count
        const total = await Product.countDocuments(filter);

        // Get subcategory info
        const Category = mongoose.model('Category');
        const category = await Category.findById(categoryId);
        let subcategoryInfo = null;
        
        if (category && category.subcategories) {
            subcategoryInfo = category.subcategories.find(sub => 
                sub._id.toString() === subcategoryId
            );
        }

        // Response
        res.json({
            success: true,
            category: category ? {
                _id: category._id,
                name: category.name,
                title: category.title
            } : null,
            subcategory: subcategoryInfo ? {
                _id: subcategoryInfo._id,
                title: subcategoryInfo.title || subcategoryInfo.name,
                numericId: subcategoryInfo.numericId,
                items: subcategoryInfo.items || []
            } : null,
            products: {
                items: products,
                count: products.length,
                total,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            },
            summary: {
                message: `Found ${products.length} products in this subcategory`
            }
        });

    } catch (error) {
        console.error('❌ Error in getSubcategoryProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subcategory products',
            error: error.message
        });
    }
};