import Category from '../models/Category.model.js';
import Product from '../models/Product.model.js'
import mongoose from 'mongoose';
/* -------- GET ALL -------- */
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ numericId: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* -------- GET ONE -------- */
export const getCategory = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        // Check if it's a valid number
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID. Must be a number.'
            });
        }

        const category = await Category.findOne({ numericId: id });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* -------- CREATE (ADMIN) -------- */
export const createCategory = async (req, res) => {
    try {
        // Generate slug if not provided
        if (req.body.name && !req.body.slug) {
            req.body.slug = req.body.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }
        
        const category = await Category.create(req.body);

        res.status(201).json({
            success: true,
            category
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/* -------- UPDATE (ADMIN) -------- */
export const updateCategory = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        // Check if it's a valid number
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID. Must be a number.'
            });
        }

        const category = await Category.findOneAndUpdate(
            { numericId: id },
            req.body,
            { 
                new: true, 
                runValidators: true,
                context: 'query' // This helps with validation
            }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        // Handle duplicate key errors
        if (error.code === 11000) {
            if (error.keyValue.numericId) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot update: Category with numericId ${error.keyValue.numericId} already exists`
                });
            }
            if (error.keyValue.slug) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot update: Category with slug "${error.keyValue.slug}" already exists`
                });
            }
        }
        
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/* -------- DELETE (ADMIN) -------- */
export const deleteCategory = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        // Check if it's a valid number
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID. Must be a number.'
            });
        }

        const category = await Category.findOneAndDelete({ numericId: id });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
            deletedCategory: {
                id: category._id,
                numericId: category.numericId,
                name: category.name
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* -------- UTILITY: Fix duplicate index (temporary) -------- */
export const fixDuplicateIndex = async (req, res) => {
    try {
        // List all indexes
        const indexes = await Category.collection.getIndexes();
        console.log('Current indexes:', Object.keys(indexes));
        
        let message = 'No duplicate indexes found';
        
        // Check if name_1 index exists and drop it
        if (indexes.name_1) {
            await Category.collection.dropIndex("name_1");
            message = 'Dropped duplicate name_1 index';
            console.log(message);
        }
        
        res.status(200).json({
            success: true,
            message,
            indexes: Object.keys(await Category.collection.getIndexes())
        });
    } catch (error) {
        console.error('Error fixing index:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* -------- UTILITY: Check existing data -------- */
export const checkExistingData = async (req, res) => {
    try {
        const categories = await Category.find({});
        
        res.status(200).json({
            success: true,
            count: categories.length,
            categories: categories.map(cat => ({
                id: cat._id,
                numericId: cat.numericId,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                subcategoriesCount: cat.subcategories.length
            }))
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};


// ----------------------------------------------------------------------------//
                        //    SubCategory Controller    //

/* =========================
   GET SUBCATEGORIES BY CATEGORY ID
========================= */
export const getSubcategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        let category;
        
        // Check if categoryId is ObjectId or numericId
        if (mongoose.Types.ObjectId.isValid(categoryId) && /^[0-9a-fA-F]{24}$/.test(categoryId)) {
            // Find by MongoDB _id
            category = await Category.findById(categoryId);
        } else {
            // Find by numericId (convert to number)
            const numericId = parseInt(categoryId);
            if (isNaN(numericId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category ID'
                });
            }
            category = await Category.findOne({ numericId: numericId });
        }

        if (!category) {
            return res.status(404).json({
                success: false,
                massage:error,
                message: 'Category not found'
            });
        }

        // Return subcategories from the category document
        const subcategories = category.subcategories || [];
        
        res.json({
            success: true,
            count: subcategories.length,
            subcategories: subcategories.map(sub => ({
                _id: sub._id,
                numericId: sub.numericId,
                title: sub.title,
                items: sub.items || [],
                description: sub.description || `Browse ${sub.title} products`
            }))
        });
    } catch (error) {
        console.error('Get subcategories error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subcategories',
            error: error.message
        });
    }
};

/* =========================
   GET PRODUCTS BY SUBCATEGORY
========================= */
export const getProductsBySubcategory = async (req, res) => {
    try {
        const { subcategoryId, categoryId } = req.params;
        const { 
            page = 1, 
            limit = 20, 
            minPrice, 
            maxPrice, 
            brand,
            sortBy = 'newest',
            search 
        } = req.query;

        // Build filter
        const filter = { status: 'published' };

        // Category filter
        if (categoryId) {
            if (mongoose.Types.ObjectId.isValid(categoryId)) {
                filter.categoryId = categoryId;
            } else {
                // Try to find category by numericId
                const category = await Category.findOne({ numericId: parseInt(categoryId) });
                if (category) {
                    filter.categoryId = category._id;
                } else {
                    filter['categoryId.numericId'] = parseInt(categoryId);
                }
            }
        }

        // Subcategory filter - try multiple possible fields
        if (subcategoryId) {
            filter.$or = [
                { subcategoryId: subcategoryId },
                { subcategoryId: parseInt(subcategoryId) },
                { 'subcategory._id': subcategoryId },
                { 'subcategory.id': subcategoryId },
                { 'subcategory.numericId': parseInt(subcategoryId) }
            ];
        }

        // Price filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        // Brand filter
        if (brand) {
            filter.brand = { $regex: brand, $options: 'i' };
        }

        // Search filter
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build query
        let query = Product.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('sellerId', 'name storeName')
            .populate('categoryId', 'name color icon description');

        // Apply sorting
        switch (sortBy) {
            case 'price-low':
                query = query.sort({ price: 1 });
                break;
            case 'price-high':
                query = query.sort({ price: -1 });
                break;
            case 'rating':
                query = query.sort({ rating: -1 });
                break;
            case 'discount':
                query = query.sort({ discount: -1 });
                break;
            case 'name-asc':
                query = query.sort({ name: 1 });
                break;
            case 'name-desc':
                query = query.sort({ name: -1 });
                break;
            case 'popular':
                query = query.sort({ views: -1 });
                break;
            default: // 'newest'
                query = query.sort({ createdAt: -1 });
        }

        const products = await query;
        const total = await Product.countDocuments(filter);

        // Get brands for filter
        const brands = await Product.distinct('brand', filter);

        res.json({
            success: true,
            count: products.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            brands: brands.filter(b => b).sort(),
            minPrice: minPrice || 0,
            maxPrice: maxPrice || await Product.findOne(filter).sort({ price: -1 }).select('price').then(p => p?.price || 0),
            products
        });
    } catch (error) {
        console.error('Get products by subcategory error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products by subcategory',
            error: error.message
        });
    }
};

/* =========================
   GET SUBCATEGORY DETAILS
========================= */
export const getSubcategoryDetails = async (req, res) => {
    try {
        const { categoryId, subcategoryId } = req.params;

        // Find the category
        let category;
        if (mongoose.Types.ObjectId.isValid(categoryId) && /^[0-9a-fA-F]{24}$/.test(categoryId)) {
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

        // Find the subcategory
        const subcategories = category.subcategories || [];
        const subcategory = subcategories.find(sub => 
            sub._id?.toString() === subcategoryId ||
            sub.id === subcategoryId ||
            sub.numericId?.toString() === subcategoryId
        );

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        // Get product count
        const productCount = await Product.countDocuments({
            status: 'published',
            $or: [
                { subcategoryId: subcategory._id || subcategory.id || subcategory.numericId },
                { 'subcategory._id': subcategory._id },
                { 'subcategory.id': subcategory.id },
                { 'subcategory.numericId': subcategory.numericId }
            ]
        });

        res.json({
            success: true,
            subcategory: {
                ...subcategory,
                productCount
            }
        });
    } catch (error) {
        console.error('Get subcategory details error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subcategory details',
            error: error.message
        });
    }
};                    