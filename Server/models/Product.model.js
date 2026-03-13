import mongoose from 'mongoose';

/* ===============================
   SUB SCHEMAS
================================ */

const analyticsSchema = new mongoose.Schema(
  {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  },
  { _id: false }
);

const inventorySchema = new mongoose.Schema(
  {
    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    moq: { type: Number, default: 1 },
    manageStock: { type: Boolean, default: true }
  },
  { _id: false }
);

const packagingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['box', 'bag', 'bundle', 'pallet', 'roll', 'crate', 'loose'],
      default: 'bag'
    },
    quantityPerPackage: {
      type: Number,
      default: 1
    }
  },
  { _id: false }
);

/* ===============================
   PRODUCT SCHEMA
================================ */

const productSchema = new mongoose.Schema(
  {
    /* -------- BASIC INFO -------- */
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      lowercase: true,
      index: true
    },

    brand: {
      type: String,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    /* -------- CATEGORY RELATION -------- */
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true
    },

    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: true,
      index: true
    },

    itemTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItemType',
      index: true
    },

    /* -------- CONSTRUCTION SPECS -------- */
    grade: String,            // e.g. OPC 53, Fe500
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

    /* -------- PRICING -------- */
    price: {
      type: Number,
      required: true,
      min: 0
    },

    originalPrice: {
      type: Number,
      min: 0
    },

    discountPercentage: {
      type: Number,
      default: 0
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
      default: 'bag'
    },

    /* -------- MEDIA -------- */
    images: {
      type: [String],
      validate: [(v) => v.length > 0, 'At least one image is required']
    },

    /* -------- INVENTORY -------- */
    inventory: inventorySchema,
    packaging: packagingSchema,

    /* -------- SELLER -------- */
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    /* -------- STATUS -------- */
    status: {
      type: String,
      enum: ['draft', 'published', 'out_of_stock'],
      default: 'draft',
      index: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    /* -------- SEO -------- */
    seo: {
      title: String,
      description: String,
      keywords: [String]
    },

    /* -------- HOT DEAL -------- */
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

         /* -------- TRENDING -------- */
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
   PRE SAVE HOOKS
================================ */

productSchema.pre('save', function () {
  // Auto slug
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Auto discount calculation
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discountPercentage = Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  } else {
    this.discountPercentage = 0;
  }

});

/* ===============================
   INDEXES (PERFORMANCE)
================================ */

productSchema.index({ categoryId: 1, subCategoryId: 1 });
productSchema.index({ status: 1, isActive: 1 });
productSchema.index({ 'hotDeal.isApproved': 1, 'hotDeal.priority': -1 });
productSchema.index({ 'trending.isApproved': 1, createdAt: -1 });
productSchema.index({ price: 1 });

/* ===============================
   EXPORT
================================ */

const Product = mongoose.model('Product', productSchema);
export default Product;