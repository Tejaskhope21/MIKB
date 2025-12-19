import Category from '../models/Category.model.js';

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