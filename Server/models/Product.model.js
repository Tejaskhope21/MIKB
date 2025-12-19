import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    numericId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    categoryId: { type: Number, required: true },
    subcategoryId: Number,
    images: [{ type: String }], // Changed from single image to array
    brand: String,
    description: String,
    price: { type: Number, required: true },
    originalPrice: Number,
    rating: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    specs: [String],

    // Inventory Management
    inventory: {
        sku: { type: String, unique: true },
        stock: { type: Number, default: 0 },
        lowStockThreshold: { type: Number, default: 10 },
        isInStock: { type: Boolean, default: true },
        manageStock: { type: Boolean, default: true },
        backorders: {
            type: String,
            enum: ['no', 'notify', 'allow'],
            default: 'no'
        },
        soldCount: { type: Number, default: 0 },
        reservedStock: { type: Number, default: 0 }
    },

    // Shipping & Dimensions
    shipping: {
        weight: Number,
        dimensions: {
            length: Number,
            width: Number,
            height: Number
        },
        shippingClass: String
    },

    minOrder: { type: Number, default: 1 },
    unit: { type: String, default: 'unit' },

    // Product Variations
    variations: [{
        name: String,
        options: [String],
        variantType: {
            type: String,
            enum: ['color', 'size', 'material', 'other']
        }
    }],

    // Product variants
    variants: [{
        sku: String,
        name: String,
        price: Number,
        stock: Number,
        attributes: mongoose.Schema.Types.Mixed,
        image: String
    }],

    // Seller Information
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    storeName: String,

    // Product Status
    status: {
        type: String,
        enum: ['draft', 'published', 'out_of_stock', 'discontinued', 'archived'],
        default: 'draft'
    },

    // SEO
    seo: {
        title: String,
        description: String,
        keywords: [String]
    },

    // Additional Details
    warranty: String,
    returnPolicy: String,
    tags: [String],

    // Reviews & Ratings
    reviews: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        images: [String],
        createdAt: { type: Date, default: Date.now }
    }],

    // Performance Metrics
    views: { type: Number, default: 0 },
    wishlists: { type: Number, default: 0 },

    // Audit
    lastRestocked: Date,
    lastSold: Date
}, {
    timestamps: true
});

// Auto-generate SKU before saving
productSchema.pre('save', function (next) {
    if (!this.inventory.sku) {
        const prefix = this.brand ? this.brand.substring(0, 3).toUpperCase() : 'PRD';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000);
        this.inventory.sku = `${prefix}-${timestamp}-${random}`;
    }

    // Update isInStock based on stock
    if (this.inventory.manageStock) {
        this.inventory.isInStock = this.inventory.stock > this.inventory.lowStockThreshold;
    }

    next();
});

// Virtual for available stock
productSchema.virtual('availableStock').get(function () {
    return this.inventory.stock - this.inventory.reservedStock;
});

// Method to reserve stock
productSchema.methods.reserveStock = function (quantity) {
    if (this.inventory.stock - this.inventory.reservedStock >= quantity) {
        this.inventory.reservedStock += quantity;
        return true;
    }
    return false;
};

// Method to release reserved stock
productSchema.methods.releaseStock = function (quantity) {
    if (this.inventory.reservedStock >= quantity) {
        this.inventory.reservedStock -= quantity;
        return true;
    }
    return false;
};

// Method to update stock after sale
productSchema.methods.updateStock = function (quantity) {
    if (this.inventory.reservedStock >= quantity) {
        this.inventory.reservedStock -= quantity;
    }
    this.inventory.stock -= quantity;
    this.inventory.soldCount += quantity;
    this.lastSold = new Date();

    // Update stock status
    if (this.inventory.stock <= 0) {
        this.status = 'out_of_stock';
        this.inventory.isInStock = false;
    }
};

export default mongoose.model('Product', productSchema);