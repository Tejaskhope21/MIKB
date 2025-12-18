import Category from '../models/Category.model.js';

// Get all categories (Public)
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json({ success: true, count: categories.length, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single category (Public)
export const getCategory = async (req, res) => {
    try {
        const category = await Category.findOne({ numericId: req.params.id });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create category (Admin only)
export const createCategory = async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.status(201).json({ success: true, category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update category (Admin only)
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findOneAndUpdate(
            { numericId: req.params.id },
            req.body,
            { new: true }
        );
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete category (Admin only)
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({ numericId: req.params.id });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};