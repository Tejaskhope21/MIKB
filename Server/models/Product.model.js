// models/Product.model.js
import mongoose from 'mongoose';

// Custom validator
const arrayLimit = (val) => Array.isArray(val) && val.length > 0;

const productSchema = new mongoose.Schema(
    {
        // Basic Information
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },

        subcategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            default: null,
        },

        brand: {
            type: String,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        // Construction Specific
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
                'insulation',
                'roofing',
                'other',
            ],
            default: 'other',
        },

        grade: String,
        color: String,
        finish: String,
        application: [String],

        // Technical Specifications
        technicalSpecs: {
            thickness: String,
            weight: String,
            density: String,
            waterResistance: { type: Boolean, default: false },
            fireResistant: { type: Boolean, default: false },
            thermalInsulation: { type: Boolean, default: false },
        },

        // Pricing
        price: {
            type: Number,
            required: true,
            min: 0,
        },

        originalPrice: {
            type: Number,
            min: 0,
        },

        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        // Images
        images: {
            type: [String],
            required: true,
            validate: [arrayLimit, 'At least one image is required'],
        },

        // Inventory
        inventory: {
            sku: {
                type: String,
                unique: true,
                sparse: true,
            },
            stock: { type: Number, default: 0, min: 0 },
            lowStockThreshold: { type: Number, default: 10 },
            moq: { type: Number, default: 1 },
            manageStock: { type: Boolean, default: true },
            bulkDiscount: { type: Boolean, default: false },
            bulkTiers: [
                {
                    minQuantity: Number,
                    discountPercent: Number,
                },
            ],
        },

        // Shipping & Packaging
        unitType: {
            type: String,
            enum: ['piece', 'kg', 'ton', 'meter', 'sq-meter', 'cubic-meter', 'bag', 'set', 'roll'],
            default: 'piece',
        },

        packaging: {
            type: {
                type: String,
                enum: ['box', 'bag', 'bundle', 'pallet', 'roll', 'crate', 'loose'],
                default: 'box',
            },
            quantityPerPackage: { type: Number, default: 1 },
        },

        // Variants
        variants: [
            {
                name: String,
                sku: String,
                price: Number,
                stock: Number,
                attributes: mongoose.Schema.Types.Mixed,
                image: String,
            },
        ],

        // Seller
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        storeName: String,

        // Status
        status: {
            type: String,
            enum: ['draft', 'published', 'out_of_stock', 'archived'],
            default: 'draft',
        },

        // SEO & Extra
        certifications: [String],
        tags: [String],

        seo: {
            title: String,
            description: String,
            keywords: [String],
        },

        rating: { type: Number, default: 0 },
        views: { type: Number, default: 0 },
    },
    { timestamps: true }
);

/* =======================
   PRE-SAVE HOOK (FIXED)
======================= */
productSchema.pre('save', async function () {
    // Ensure inventory exists
    if (!this.inventory) this.inventory = {};

    // Generate SKU
    if (!this.inventory.sku) {
        const prefix = this.brand
            ? this.brand.substring(0, 3).toUpperCase().replace(/\s/g, '')
            : 'PRD';
        this.inventory.sku = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    // Variant SKUs
    if (this.variants?.length) {
        this.variants.forEach((variant) => {
            if (!variant.sku) {
                variant.sku = `VAR-${Math.floor(10000 + Math.random() * 90000)}`;
            }
        });
    }

    // Discount calculation
    if (this.originalPrice && this.originalPrice > this.price) {
        this.discount = Math.round(
            ((this.originalPrice - this.price) / this.originalPrice) * 100
        );
    } else {
        this.discount = 0;
    }

    // Stock-based status
    if (this.inventory.stock <= 0 && this.status !== 'archived') {
        this.status = 'out_of_stock';
    }
});

/* Indexes */
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ categoryId: 1 });
productSchema.index({ sellerId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ 'inventory.sku': 1 });

export default mongoose.model('Product', productSchema);
