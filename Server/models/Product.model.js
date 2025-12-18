import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    numericId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    categoryId: { type: Number, required: true },
    subcategoryId: Number,
    image: String,
    brand: String,
    description: String,
    price: { type: Number, required: true },
    originalPrice: Number,
    rating: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    specs: [String],
    minOrder: { type: Number, default: 1 },
    unit: { type: String, default: 'unit' },
    inStock: { type: Boolean, default: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // New: Seller/Owner
}, { timestamps: true });

export default mongoose.model('Product', productSchema);