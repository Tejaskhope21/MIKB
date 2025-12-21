// models/MaterialRequirement.js
import mongoose from 'mongoose';
import crypto from 'crypto';

const materialRequirementSchema = new mongoose.Schema(
    {
        /* ===== BASIC INFO ===== */
        requirementNumber: {
            type: String,
            unique: true,
            default: function() {
                return `REQ-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
            }
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        /* ===== USER DETAILS ===== */
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true
        },

        company: String,

        phone: {
            type: String,
            required: [true, 'Phone is required'],
            match: [/^[0-9]{10}$/, 'Invalid 10-digit phone number']
        },

        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true
        },

        /* ===== PROJECT DETAILS ===== */
        projectType: {
            type: String,
            required: [true, 'Project type is required'],
            enum: [
                'Residential Building',
                'Commercial Complex',
                'Industrial Project',
                'Infrastructure (Road/Bridge)',
                'Renovation/Remodeling',
                'Individual House',
                'Apartment Complex',
                'Other'
            ]
        },

        projectLocation: {
            type: String,
            required: [true, 'Project location is required'],
            trim: true
        },

        deliveryDate: {
            type: Date,
            required: [true, 'Delivery date is required']
        },

        budgetRange: {
            type: String,
            required: [true, 'Budget range is required'],
            enum: [
                'Under ₹1 Lakh',
                '₹1-5 Lakh',
                '₹5-10 Lakh',
                '₹10-25 Lakh',
                '₹25-50 Lakh',
                '₹50 Lakh - 1 Cr',
                'Above ₹1 Cr'
            ]
        },

        /* ===== MATERIALS ===== */
        materials: [
            {
                type: {
                    type: String,
                    required: [true, 'Material type is required'],
                    enum: [
                        'Cement',
                        'Steel/Rebar',
                        'Bricks/Blocks',
                        'Aggregates (Sand, Stone)',
                        'Ready Mix Concrete',
                        'Tiles (Floor, Wall)',
                        'Sanitaryware',
                        'Paints & Coatings',
                        'Electrical Items',
                        'Plumbing Materials',
                        'Doors & Windows',
                        'Hardware & Fittings',
                        'Other'
                    ]
                },
                quantity: {
                    type: Number,
                    required: [true, 'Quantity is required'],
                    min: 0
                },
                unit: {
                    type: String,
                    enum: ['MT', 'KG', 'Ton', 'Cubic Meter', 'Square Feet', 'Number', 'Set', 'Bag'],
                    default: 'MT'
                },
                specification: String
            }
        ],

        /* ===== ADDITIONAL DETAILS ===== */
        additionalNotes: String,

        urgencyLevel: {
            type: String,
            enum: ['low', 'normal', 'high', 'urgent'],
            default: 'normal'
        },

        siteVisitRequired: {
            type: Boolean,
            default: false
        },

        /* ===== STATUS & WORKFLOW ===== */
        status: {
            type: String,
            enum: ['pending', 'accepted', 'processing', 'completed', 'cancelled', 'rejected'],
            default: 'pending'
        },

        /* ===== ASSIGNMENT ===== */
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },

        assignedAt: Date,
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },

        /* ===== QUOTES ===== */
        quotes: [
            {
                supplierId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                amount: {
                    type: Number,
                    required: true,
                    min: 0
                },
                validity: {
                    type: Date,
                    default: function() {
                        const date = new Date();
                        date.setDate(date.getDate() + 7); // 7 days validity
                        return date;
                    }
                },
                notes: String,
                status: {
                    type: String,
                    enum: ['pending', 'accepted', 'rejected'],
                    default: 'pending'
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],

        /* ===== CANCELLATION ===== */
        cancelledAt: Date,
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        cancellationReason: String,
        cancelledByRole: {
            type: String,
            enum: ['user', 'admin', 'seller']
        },

        /* ===== TIMESTAMPS ===== */
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        completedAt: Date,
        estimatedCompletionDate: Date
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

/* =========================
   MIDDLEWARE
========================= */
materialRequirementSchema.pre('save', function() {
    this.updatedAt = Date.now();
    
});

/* =========================
   VIRTUALS
========================= */
materialRequirementSchema.virtual('totalQuantity').get(function() {
    return this.materials.reduce((sum, material) => sum + material.quantity, 0);
});

materialRequirementSchema.virtual('acceptedQuote').get(function() {
    return this.quotes.find(quote => quote.status === 'accepted');
});

materialRequirementSchema.virtual('totalQuotes').get(function() {
    return this.quotes.length;
});

/* =========================
   INDEXES
========================= */
materialRequirementSchema.index({ userId: 1, createdAt: -1 });
materialRequirementSchema.index({ status: 1 });
materialRequirementSchema.index({ assignedTo: 1 });
materialRequirementSchema.index({ requirementNumber: 1 }, { unique: true });

/* =========================
   MODEL EXPORT
========================= */
const MaterialRequirement = mongoose.model('MaterialRequirement', materialRequirementSchema);
export default MaterialRequirement;