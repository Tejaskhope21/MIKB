import mongoose from 'mongoose';

/* ===========================
   ORDER ITEM SCHEMA
=========================== */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quantity: {
      type: Number,
      min: 1,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

/* ===========================
   PAYMENT PROOF SCHEMA
=========================== */
const paymentProofSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true },
    screenshot: { type: String, required: true },

    userBankDetails: {
      bankName: { type: String, required: true },
      accountName: String,
      accountNumber: String,
      ifscCode: String,
      upiId: String,
      transactionTime: String,
    },

    companyBankDetails: {
      accountName: { type: String, default: 'Tejas Khope' },
      accountNumber: { type: String, default: '970318210000861' },
      ifscCode: { type: String, default: 'BKID0009703' },
      upiId: { type: String, default: 'khopetejas6-1@oksbi' },
      bankName: { type: String, default: 'Bank of India' },
      branch: { type: String, default: 'Mumbai Main Branch' },
    },

    amount: Number,
    uploadedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    verificationNotes: String,
    rejectionReason: String,
  },
  { _id: false }
);

/* ===========================
   ORDER SCHEMA
=========================== */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    orderId: {
      type: String,
      unique: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    shippingAddress: {
      fullName: String,
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: String,
      email: String,
    },

    paymentMethod: {
      type: String,
      enum: ['COD', 'BANK_TRANSFER'],
      default: 'COD',
    },

    paymentProof: paymentProofSchema,

    totalPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        'pending',
        'payment_pending',
        'paid',
        'shipped',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },

    notes: String,

    trackingInfo: {
      trackingNumber: String,
      carrier: String,
      shippedAt: Date,
      estimatedDelivery: Date,
      deliveredAt: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ===========================
   VIRTUALS
=========================== */
orderSchema.virtual('gstAmount').get(function () {
  return +(this.totalPrice * 0.18).toFixed(2);
});

orderSchema.virtual('grandTotal').get(function () {
  return +(this.totalPrice + this.gstAmount).toFixed(2);
});

/* ===========================
   ORDER ID (ASYNC SAFE)
=========================== */
orderSchema.pre('validate', async function () {
  if (!this.isNew || this.orderId) return;

  const lastOrder = await this.constructor
    .findOne({ orderId: { $exists: true } })
    .sort({ createdAt: -1 })
    .select('orderId')
    .lean();

  let nextNumber = 1001;

  if (lastOrder?.orderId) {
    const match = lastOrder.orderId.match(/ORD-(\d+)/);
    if (match) nextNumber = Number(match[1]) + 1;
  }

  this.orderId = `ORD-${nextNumber}`;
});

/* ===========================
   STATUS LOGIC (ASYNC SAFE)
=========================== */
orderSchema.pre('save', async function () {
  if (this.isNew) {
    this.status =
      this.paymentMethod === 'BANK_TRANSFER'
        ? 'payment_pending'
        : 'pending';
  }

  if (
    this.isModified('paymentProof') &&
    this.paymentProof?.verified === true &&
    this.status === 'payment_pending'
  ) {
    this.status = 'paid';
  }
});

/* ===========================
   EXPORT
=========================== */
export default mongoose.model('Order', orderSchema);
