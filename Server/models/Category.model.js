import mongoose from 'mongoose';

/* ---------------- Subcategory Schema ---------------- */
const subcategorySchema = new mongoose.Schema({
    numericId: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    items: {
        type: [String],
        default: []
    }
});

/* ---------------- Category Schema ---------------- */
const categorySchema = new mongoose.Schema(
    {
        numericId: {
            type: Number,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            unique: true
        },
        description: {
            type: String
        },
        color: {
            type: String,
            default: 'blue'
        },
        icon: {
            type: String
        },
        image: {
            type: String
        },
        subcategories: {
            type: [subcategorySchema],
            default: []
        }
    },
    { timestamps: true }
);

/* -------- Auto-generate slug from name -------- */
// categorySchema.pre('save', function (next) {
//     if (this.name && !this.slug) {
//         this.slug = this.name
//             .toLowerCase()
//             .replace(/[^a-z0-9]+/g, '-')
//             .replace(/(^-|-$)/g, '');
//     }
//     next();
// });

export default mongoose.model('Category', categorySchema);
