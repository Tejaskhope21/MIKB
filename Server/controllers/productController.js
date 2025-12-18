import Product from '../models/Product.model.js';

// Get all products (Public)
export const getProducts = async (req, res) => {
    try {
        const { categoryId, subcategoryId, search, sort } = req.query;
        let filter = {};

        if (categoryId) filter.categoryId = Number(categoryId);
        if (subcategoryId) filter.subcategoryId = Number(subcategoryId);
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        let sortBy = {};
        if (sort === 'price-low') sortBy.price = 1;
        else if (sort === 'price-high') sortBy.price = -1;
        else if (sort === 'rating') sortBy.rating = -1;
        else if (sort === 'discount') sortBy.discount = -1;

        const products = await Product.find(filter).sort(sortBy).populate('sellerId', 'name email');
        res.json({ success: true, count: products.length, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single product (Public)
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findOne({ numericId: req.params.id }).populate('sellerId', 'name email');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create product (Admin or Seller)
export const createProduct = async (req, res) => {
    try {
        const productData = { ...req.body, sellerId: req.user._id }; // Assign sellerId
        const product = new Product(productData);
        await product.save();
        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update product (Admin or Owner Seller)
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findOne({ numericId: req.params.id });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        // Check permission
        if (req.user.role !== 'admin' && product.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { numericId: req.params.id },
            req.body,
            { new: true }
        );
        res.json({ success: true, product: updatedProduct });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete product (Admin or Owner Seller)
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOne({ numericId: req.params.id });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        // Check permission
        if (req.user.role !== 'admin' && product.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await Product.findOneAndDelete({ numericId: req.params.id });
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};