import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
    numericId: { type: Number, required: true },
    title: { type: String, required: true },
    items: [String]
});

const categorySchema = new mongoose.Schema({
    numericId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    color: { type: String, default: 'blue' },
    icon: String,
    image: String,
    subcategories: [subcategorySchema]
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);