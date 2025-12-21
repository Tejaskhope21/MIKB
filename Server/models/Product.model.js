import mongoose from 'mongoose';

/* ===============================
   VALIDATORS
================================ */
const arrayLimit = (val) => Array.isArray(val) && val.length > 0;

/* ===============================
   PRODUCT SCHEMA
================================ */
const productSchema = new mongoose.Schema(
    {
        numericId: {
            type: Number,
            unique: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        brand: {
            type: String,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },

        subcategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            default: null
        },

        materialType: {
            type: String,
            enum: [
                'cement',
                'steel',
                'bricks',
                'sand',
                'tiles',
                'paint',
                'wood',
                'plumbing',
                'electrical',
                'hardware',
                'other'
            ],
            default: 'other'
        },

        grade: String,
        color: String,
        finish: String,

        technicalSpecs: {
            thickness: String,
            weight: String,
            density: String,
            waterResistance: Boolean,
            fireResistant: Boolean,
            thermalInsulation: Boolean
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        originalPrice: {
            type: Number,
            min: 0
        },

        discount: {
            type: Number,
            default: 0
        },

        images: {
            type: [String],
            required: true,
            validate: [arrayLimit, 'At least one image is required']
        },

        inventory: {
            stock: {
                type: Number,
                default: 0,
                min: 0
            },
            lowStockThreshold: {
                type: Number,
                default: 10
            },
            moq: {
                type: Number,
                default: 1
            },
            manageStock: {
                type: Boolean,
                default: true
            }
        },

        unitType: {
            type: String,
            enum: ['piece', 'kg', 'ton', 'bag', 'meter', 'roll'],
            default: 'piece'
        },

        packaging: {
            type: {
                type: String,
                enum: ['box', 'bag', 'bundle', 'roll', 'pallet', 'crate', 'loose'],
                default: 'box'
            },
            quantityPerPackage: {
                type: Number,
                default: 1
            }
        },

        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        status: {
            type: String,
            enum: ['draft', 'published', 'out_of_stock'],
            default: 'draft'
        },

        seo: {
            title: String,
            description: String,
            keywords: [String]
        }
    },
    {
        timestamps: true
    }
);

/* ===============================
   PRE-SAVE HOOKS
================================ */
productSchema.pre('save', async function (next) {
    try {
        // Auto-generate numericId
        if (!this.numericId) {
            const lastProduct = await this.constructor
                .findOne({}, { numericId: 1 })
                .sort({ numericId: -1 });

            this.numericId = lastProduct ? lastProduct.numericId + 1 : 1000;
        }

        // Auto-calculate discount
        if (this.originalPrice && this.originalPrice > this.price) {
            this.discount = Math.round(
                ((this.originalPrice - this.price) / this.originalPrice) * 100
            );
        } else {
            this.discount = 0;
        }

        next();
    } catch (error) {
        next(error);
    }
});

/* ===============================
   EXPORT MODEL
================================ */
const Product = mongoose.model('Product', productSchema);
export default Product;