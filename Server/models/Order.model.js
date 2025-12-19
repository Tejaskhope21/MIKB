import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    numericId: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    image: {
        type: String
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending'
    },
    cancellationReason: {
        type: String
    },
    returnReason: {
        type: String
    },
    returnStatus: {
        type: String,
        enum: ['requested', 'approved', 'rejected', 'completed', null],
        default: null
    }
});

const paymentSchema = new mongoose.Schema({
    method: {
        type: String,
        enum: ['cod', 'online', 'wallet', 'card'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    paidAt: {
        type: Date
    }
});

const addressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    addressLine: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        default: 'India'
    },
    type: {
        type: String,
        enum: ['home', 'office', 'other'],
        default: 'home'
    }
});

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    shippingAddress: addressSchema,
    billingAddress: {
        type: addressSchema,
        default: function () {
            return this.shippingAddress;
        }
    },
    payment: paymentSchema,
    shipping: {
        method: {
            type: String,
            enum: ['standard', 'express', 'overnight'],
            default: 'standard'
        },
        cost: {
            type: Number,
            default: 0
        },
        trackingNumber: {
            type: String
        },
        carrier: {
            type: String
        },
        estimatedDelivery: {
            type: Date
        },
        deliveredAt: {
            type: Date
        }
    },
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    sellerAmount: {
        type: Number, // Amount after commission
        required: true
    },
    commissionAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    notes: {
        type: String
    },
    cancellationReason: {
        type: String
    },
    refundReason: {
        type: String
    }
}, {
    timestamps: true
});

// Generate order ID before saving
orderSchema.pre('save', function (next) {
    if (!this.orderId) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        this.orderId = `ORD${timestamp}${random}`;
    }
    next();
});

// Indexes for faster queries
orderSchema.index({ sellerId: 1, status: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ 'items.sellerId': 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model('Order', orderSchema);