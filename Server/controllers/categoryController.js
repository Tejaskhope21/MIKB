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
        const id = Number(req.params.id);

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
        const id = Number(req.params.id);

        const category = await Category.findOneAndUpdate(
            { numericId: id },
            req.body,
            { new: true, runValidators: true }
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
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/* -------- DELETE (ADMIN) -------- */
export const deleteCategory = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const category = await Category.findOneAndDelete({ numericId: id });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
