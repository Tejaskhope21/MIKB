// models/Product.model.js

import mongoose from 'mongoose';

/* ===============================
   HELPERS
================================ */
const arrayLimit = (val) => Array.isArray(val) && val.length > 0;

/* ===============================
   SUB SCHEMAS
================================ */
const analyticsSchema = {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
};

/* ===============================
   PRODUCT SCHEMA
================================ */
const productSchema = new mongoose.Schema(
    {
        /* ===============================
           BASIC INFO
        =============================== */
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

        /* ===============================
           CATEGORY
        =============================== */
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

        /* ===============================
           PRICING
        =============================== */
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

        /* ===============================
           MEDIA
        =============================== */
        images: {
            type: [String],
            required: true,
            validate: [arrayLimit, 'At least one image is required']
        },

        /* ===============================
           INVENTORY
        =============================== */
        inventory: {
            stock: { type: Number, default: 0 },
            lowStockThreshold: { type: Number, default: 10 },
            moq: { type: Number, default: 1 },
            manageStock: { type: Boolean, default: true }
        },

        unitType: {
            type: String,
            enum: [
                'piece',
                'kg',
                'ton',
                'meter',
                'sq-meter',
                'cubic-meter',
                'bag',
                'set',
                'roll'
            ],
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
                default: 1
            }
        },

        /* ===============================
           SELLER & STATUS
        =============================== */
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

        /* ===============================
           SEO
        =============================== */
        seo: {
            title: String,
            description: String,
            keywords: [String]
        },

        /* ===============================
           HOT DEAL
        =============================== */
        hotDeal: {
            isRequested: { type: Boolean, default: false },
            isApproved: { type: Boolean, default: false },
            isRejected: { type: Boolean, default: false },
            isExpired: { type: Boolean, default: false },
            isPaid: { type: Boolean, default: false },

            priority: { type: Number, default: 0 },

            requestedAt: Date,
            approvedAt: Date,
            expiresAt: Date,

            analytics: analyticsSchema
        },

        /* ===============================
           TRENDING
        =============================== */
        trending: {
            isRequested: { type: Boolean, default: false },
            isApproved: { type: Boolean, default: false },
            isRejected: { type: Boolean, default: false },

            requestedAt: Date,
            approvedAt: Date,
            rejectedAt: Date,

            analytics: analyticsSchema
        }
    },
    { timestamps: true }
);

/* ===============================
   PRE-SAVE HOOKS
================================ */
productSchema.pre('save', async function () {
    /* Auto numericId */
    if (!this.numericId) {
        const last = await this.constructor
            .findOne({}, { numericId: 1 })
            .sort({ numericId: -1 })
            .lean();

        this.numericId = last ? last.numericId + 1 : 1000;
    }

    /* Auto discount */
    if (this.originalPrice && this.originalPrice > this.price) {
        this.discount = Math.round(
            ((this.originalPrice - this.price) / this.originalPrice) * 100
        );
    } else {
        this.discount = 0;
    }
});

/* ===============================
   INDEXES (PERFORMANCE)
================================ */
productSchema.index({
    sellerId: 1,
    status: 1
});

productSchema.index({
    'hotDeal.isApproved': 1,
    'hotDeal.expiresAt': 1,
    'hotDeal.priority': -1
});

productSchema.index({
    'trending.isApproved': 1,
    createdAt: -1
});

/* ===============================
   EXPORT
================================ */
const Product = mongoose.model('Product', productSchema);
export default Product;
