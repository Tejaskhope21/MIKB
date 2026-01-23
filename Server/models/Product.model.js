// models/Product.model.js

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
            required: [true, 'Product name is required'],
            trim: true
        },

        brand: {
            type: String,
            trim: true
        },

        description: {
            type: String,
            required: [true, 'Product description is required']
        },

        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required']
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
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        },

        originalPrice: {
            type: Number,
            min: [0, 'Original price cannot be negative']
        },

        discount: {
            type: Number,
            default: 0
        },

        images: {
            type: [String],
            required: [true, 'At least one product image is required'],
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
                default: 1,
                min: 1
            },
            manageStock: {
                type: Boolean,
                default: true
            }
        },

        unitType: {
            type: String,
            enum: ['piece', 'kg', 'ton', 'meter', 'sq-meter', 'cubic-meter', 'bag', 'set', 'roll'],
            default: 'piece'
        },

        packaging: {
            type: {
                type: String,
                enum: ['box', 'bag', 'bundle', 'pallet', 'roll', 'crate', 'loose'],
                default: 'box'
            },
            quantityPerPackage: {
                type: Number,
                default: 1,
                min: 1
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
        },
        hotDeal: {
    isRequested: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isRejected: {
        type: Boolean,
        default: false
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    priority: {
        type: Number,
        default: 0
    },
    approvedAt: Date,
    expiresAt: Date,

    // Analytics
    views: {
        type: Number,
        default: 0
    },
    clicks: {
        type: Number,
        default: 0
    }
},
trending: {
    isRequested: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isRejected: {
        type: Boolean,
        default: false
    },
    requestedAt: Date,
    approvedAt: Date,
    rejectedAt: Date,

    /* ===== ANALYTICS ===== */
    views: {
        type: Number,
        default: 0
    },
    clicks: {
        type: Number,
        default: 0
    }
     }    },
    {
        timestamps: true
    }
);

/* ===============================
   PRE-SAVE HOOK (FIXED)
================================ */
// IMPORTANT: This is an async middleware → NO 'next' parameter and NO call to next()
productSchema.pre('save', async function () {
    try {
        // Auto-generate numericId if not present
        if (!this.numericId) {
            const lastProduct = await this.constructor
                .findOne({}, { numericId: 1 })
                .sort({ numericId: -1 })
                .lean(); // .lean() for better performance (no Mongoose document overhead)

            this.numericId = lastProduct ? lastProduct.numericId + 1 : 1000;
        }

        // Auto-calculate discount percentage
        if (this.originalPrice && this.originalPrice > this.price) {
            this.discount = Math.round(
                ((this.originalPrice - this.price) / this.originalPrice) * 100
            );
        } else {
            this.discount = 0;
        }

        // No need to call next() — just let the async function resolve
    } catch (error) {
        // Propagate the error so Mongoose rejects the save
        throw error;
    }
});
productSchema.index({
    'hotDeal.isApproved': 1,
    'hotDeal.expiresAt': 1,
    'hotDeal.priority': -1,
    'trending.isApproved': 1,
    createdAt: -1
});

/* ===============================
   EXPORT MODEL
================================ */
const Product = mongoose.model('Product', productSchema);

export default Product;