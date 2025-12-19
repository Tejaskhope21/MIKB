import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
    payoutId: {
        type: String,
        required: true,
        unique: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    method: {
        type: String,
        enum: ['bank', 'upi', 'wallet'],
        required: true
    },
    details: {
        // For bank transfer
        accountNumber: String,
        ifscCode: String,
        bankName: String,
        accountName: String,
        // For UPI
        upiId: String,
        // For wallet
        walletId: String,
        walletType: String
    },
    orders: [{
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        },
        orderAmount: Number,
        commission: Number,
        netAmount: Number
    }],
    periodStart: {
        type: Date,
        required: true
    },
    periodEnd: {
        type: Date,
        required: true
    },
    processedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    failureReason: {
        type: String
    },
    transactionId: {
        type: String
    }
}, {
    timestamps: true
});

// Generate payout ID before saving
payoutSchema.pre('save', function (next) {
    if (!this.payoutId) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        this.payoutId = `PAY${timestamp}${random}`;
    }
    next();
});

// Indexes
payoutSchema.index({ sellerId: 1, status: 1 });
payoutSchema.index({ createdAt: -1 });

export default mongoose.model('Payout', payoutSchema);