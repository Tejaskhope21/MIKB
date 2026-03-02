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
    const q = (req.query.q || '').trim();
    const limit = Number(req.query.limit) || 8;

    if (!q) {
      return res.json({
        success: true,
        products: [],
        categories: [],
        subcategories: []
      });
    }

    const regex = new RegExp(q, 'i');

    const [products, categories] = await Promise.all([
      Product.find({
        isActive: true,
        status: 'published',
        $or: [
          { name: regex },
          { brand: regex },
          { tags: regex }
        ]
      })
        .select('name slug price images categoryId')
        .limit(limit)
        .lean(),

      Category.find({
        $or: [
          { name: regex },
          { 'subcategories.title': regex }
        ]
      })
        .select('name subcategories')
        .limit(5)
        .lean()
    ]);

    const subcategories = [];
    categories.forEach(cat => {
      cat.subcategories?.forEach(sub => {
        if (regex.test(sub.title)) {
          subcategories.push({
            _id: sub._id,
            title: sub.title,
            categoryId: cat._id,
            categoryName: cat.name
          });
        }
      });
    });

    res.json({
      success: true,
      products,
      categories: categories.map(c => ({
        _id: c._id,
        name: c.name
      })),
      subcategories: subcategories.slice(0, limit)
    });

  } catch (err) {
    console.error('Autocomplete error:', err);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
};


// Full search with pagination
export const fullSearch = async (req, res) => {
  try {
    const {
      q = '',
      categoryId,
      subCategoryId,
      brand,
      minPrice,
      maxPrice,
      sort = 'relevance',
      page = 1,
      limit = 20
    } = req.query;

    if (!q.trim()) {
      return res.json({
        success: true,
        products: [],
        total: 0,
        pages: 0
      });
    }

    const regex = new RegExp(q, 'i');
    const filter = {
      isActive: true,
      status: 'published',
      $or: [
        { name: regex },
        { brand: regex },
        { tags: regex }
      ]
    };

    if (categoryId) filter.categoryId = categoryId;
    if (subCategoryId) filter.subCategoryId = subCategoryId;

    if (brand) {
      filter.brand = new RegExp(`^${brand}$`, 'i');
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortQuery = { createdAt: -1 };
    if (sort === 'price-low') sortQuery = { price: 1 };
    if (sort === 'price-high') sortQuery = { price: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('name slug price images brand rating')
        .sort(sortQuery)
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });

  } catch (err) {
    console.error('Full search error:', err);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
};


// Get search suggestions (trending searches)
export const getSearchSuggestions = async (req, res) => {
  try {
    const trendingSearches = [
      'cement',
      'steel',
      'bricks',
      'tiles',
      'paint',
      'sanitary'
    ];

    const categories = await Category.find()
      .select('name icon')
      .limit(6)
      .lean();

    res.json({
      success: true,
      trendingSearches,
      categories
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to load suggestions'
    });
  }
};
