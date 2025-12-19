import mongoose from 'mongoose';

// validator: at least 1 image
const arrayLimit = (val) => Array.isArray(val) && val.length > 0;

const productSchema = new mongoose.Schema(
    {
        numericId: {
            type: Number,
            unique: true,
            sparse: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        brand: String,

        description: {
            type: String,
            required: true
        },

        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
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
            required: true
        },

        originalPrice: Number,

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
            stock: { type: Number, default: 0 },
            lowStockThreshold: { type: Number, default: 10 },
            moq: { type: Number, default: 1 },
            manageStock: { type: Boolean, default: true }
        },

        unitType: {
            type: String,
            enum: ['piece', 'kg', 'ton', 'bag'],
            default: 'piece'
        },

        packaging: {
            type: {
                type: String,
                enum: ['box', 'bag', 'bundle'],
                default: 'box'
            },
            quantityPerPackage: { type: Number, default: 1 }
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
    { timestamps: true }
);

/* ===== PRE SAVE HOOK ===== */
productSchema.pre('save', async function () {
    if (this.originalPrice && this.originalPrice > this.price) {
        this.discount = Math.round(
            ((this.originalPrice - this.price) / this.originalPrice) * 100
        );
    }

    if (!this.numericId) {
        const last = await this.constructor.findOne({}, {}, { sort: { numericId: -1 } });
        this.numericId = last ? last.numericId + 1 : 1000;
    }
});

export default mongoose.model('Product', productSchema);
