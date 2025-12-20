// backend/controllers/searchController.js
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import mongoose from 'mongoose';

// Helper function to flatten subcategories for search
const flattenSubcategories = (categories) => {
    const subcategories = [];
    
    categories.forEach(category => {
        if (category.subcategories && category.subcategories.length > 0) {
            category.subcategories.forEach(sub => {
                subcategories.push({
                    _id: sub._id,
                    title: sub.title,
                    name: sub.title,
                    category: category._id,
                    categoryName: category.name,
                    numericId: sub.numericId,
                    items: sub.items || []
                });
            });
        }
    });
    
    return subcategories;
};

// Autocomplete search
export const autocompleteSearch = async (req, res) => {
    try {
        const query = req.query.q || '';
        const limit = parseInt(req.query.limit) || 8;

        if (!query || query.trim().length === 0) {
            return res.status(200).json({
                success: true,
                products: [],
                categories: [],
                subcategories: []
            });
        }

        const searchRegex = new RegExp(query, 'i');

        // Run all searches in parallel for better performance
        const [products, categories] = await Promise.all([
            // Search products
            Product.find({
                $or: [
                    { name: { $regex: searchRegex } },
                    { productName: { $regex: searchRegex } },
                    { brand: { $regex: searchRegex } },
                    { description: { $regex: searchRegex } },
                    { tags: { $regex: searchRegex } }
                ]
            })
            .select('name productName brand price sellingPrice images categoryId')
            .limit(limit)
            .lean(),

            // Search categories (including subcategories)
            Category.find({
                $or: [
                    { name: { $regex: searchRegex } },
                    { description: { $regex: searchRegex } },
                    { 'subcategories.title': { $regex: searchRegex } }
                ]
            })
            .select('name description icon subcategories')
            .limit(limit * 2)
            .lean()
        ]);

        // Extract subcategories from categories
        const allSubcategories = flattenSubcategories(categories);
        
        // Filter subcategories that match the search
        const matchedSubcategories = allSubcategories.filter(sub => 
            sub.title.match(searchRegex)
        ).slice(0, limit);

        // Filter categories that don't have matching subcategories (pure category matches)
        const matchedCategories = categories.filter(cat => 
            cat.name.match(searchRegex) || cat.description?.match(searchRegex)
        ).slice(0, limit);

        // Get category names for products
        const productCategoryIds = [...new Set(products.map(p => p.categoryId).filter(Boolean))];
        const categoryMap = {};
        
        if (productCategoryIds.length > 0) {
            const productCategories = await Category.find({
                _id: { $in: productCategoryIds }
            }).select('name').lean();
            
            productCategories.forEach(cat => {
                categoryMap[cat._id.toString()] = cat.name;
            });
        }

        const productsWithCategoryNames = products.map(product => ({
            ...product,
            categoryName: product.categoryId ? (categoryMap[product.categoryId.toString()] || 'Unknown') : 'Unknown'
        }));

        return res.status(200).json({
            success: true,
            products: productsWithCategoryNames,
            categories: matchedCategories,
            subcategories: matchedSubcategories,
            query,
            totalResults: productsWithCategoryNames.length + matchedCategories.length + matchedSubcategories.length
        });

    } catch (error) {
        console.error('Autocomplete search error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to perform search',
            message: error.message
        });
    }
};

// Full search with pagination
export const fullSearch = async (req, res) => {
    try {
        const query = req.query.q || '';
        const category = req.query.category;
        const subcategory = req.query.subcategory;
        const minPrice = parseFloat(req.query.minPrice);
        const maxPrice = parseFloat(req.query.maxPrice);
        const brand = req.query.brand;
        const sortBy = req.query.sortBy || 'relevance';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        if (!query || query.trim().length === 0) {
            return res.status(200).json({
                success: true,
                products: [],
                total: 0,
                page,
                pages: 0,
                filters: {}
            });
        }

        const searchRegex = new RegExp(query, 'i');
        const filter = {
            $or: [
                { name: { $regex: searchRegex } },
                { productName: { $regex: searchRegex } },
                { brand: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
                { tags: { $regex: searchRegex } }
            ]
        };

        // Apply category filter
        if (category) {
            let categoryDoc;
            if (mongoose.Types.ObjectId.isValid(category)) {
                categoryDoc = await Category.findById(category);
            } else {
                categoryDoc = await Category.findOne({ numericId: parseInt(category) });
            }
            
            if (categoryDoc) {
                filter.categoryId = categoryDoc._id;
            }
        }

        // Apply subcategory filter
        if (subcategory) {
            filter.subcategoryId = parseInt(subcategory);
        }

        // Apply price filter
        if (!isNaN(minPrice) || !isNaN(maxPrice)) {
            filter.price = {};
            if (!isNaN(minPrice)) filter.price.$gte = minPrice;
            if (!isNaN(maxPrice)) filter.price.$lte = maxPrice;
        }

        // Apply brand filter
        if (brand) {
            filter.brand = { $regex: new RegExp(brand, 'i') };
        }

        // Build sort object
        let sort = {};
        switch (sortBy) {
            case 'price-low':
                sort = { price: 1 };
                break;
            case 'price-high':
                sort = { price: -1 };
                break;
            case 'rating':
                sort = { rating: -1 };
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            default:
                // Relevance - sort by text score if using MongoDB Atlas search
                sort = { score: { $meta: 'textScore' } };
        }

        const [products, total] = await Promise.all([
            Product.find(filter)
                .select('name productName brand price sellingPrice images rating description categoryId subcategoryId inStock tags')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(filter)
        ]);

        // Get category names for products
        const categoryIds = [...new Set(products.map(p => p.categoryId).filter(Boolean))];
        const categoryMap = {};
        
        if (categoryIds.length > 0) {
            const categories = await Category.find({
                _id: { $in: categoryIds }
            }).select('name').lean();
            
            categories.forEach(cat => {
                categoryMap[cat._id.toString()] = cat.name;
            });
        }

        const productsWithDetails = products.map(product => ({
            ...product,
            categoryName: product.categoryId ? (categoryMap[product.categoryId.toString()] || 'Unknown') : 'Unknown'
        }));

        // Get available filters
        const availableBrands = await Product.distinct('brand', filter);
        const priceRange = await Product.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            products: productsWithDetails,
            total,
            page,
            pages: Math.ceil(total / limit),
            filters: {
                brands: availableBrands.filter(Boolean).sort(),
                priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
            },
            query
        });

    } catch (error) {
        console.error('Full search error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to perform search',
            message: error.message
        });
    }
};

// Get search suggestions (trending searches)
export const getSearchSuggestions = async (req, res) => {
    try {
        // You can implement trending searches, popular categories, etc.
        const trendingSearches = [
            'cement',
            'steel rods',
            'bricks',
            'tiles',
            'paint',
            'sanitary ware',
            'electrical wires'
        ];

        // Get popular categories
        const popularCategories = await Category.find()
            .select('name icon')
            .limit(6)
            .lean();

        return res.status(200).json({
            success: true,
            trendingSearches,
            popularCategories
        });
    } catch (error) {
        console.error('Get search suggestions error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get search suggestions',
            message: error.message
        });
    }
};