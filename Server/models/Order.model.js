// import mongoose from 'mongoose';

// /* ===========================
//    ORDER ITEM SCHEMA
// =========================== */
// const orderItemSchema = new mongoose.Schema(
//     {
//         product: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Product',
//             required: true
//         },

//         seller: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User',
//             required: true
//         },

//         quantity: {
//             type: Number,
//             required: true,
//             min: 1
//         },

//         price: {
//             type: Number,
//             required: true
//         }
//     },
//     { _id: false }
// );

// /* ===========================
//    ORDER SCHEMA
// =========================== */
// const orderSchema = new mongoose.Schema(
//     {
//         user: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User',
//             required: true
//         },

//         orderId: {
//             type: String,
//             unique: true
//         },

//         items: {
//             type: [orderItemSchema],
//             required: true
//         },

//         shippingAddress: {
//             address: { type: String, required: true },
//             city: { type: String, required: true },
//             state: { type: String, required: true },
//             pincode: { type: String, required: true }
//         },

//         paymentMethod: {
//             type: String,
//             required: true,
//             enum: ['COD', 'BANK_TRANSFER']
//         },

//         paymentProof: {
//             transactionId: String,
//             screenshot: String,
//             bankName: String
//         },

//         totalPrice: {
//             type: Number,
//             required: true
//         },

//         status: {
//             type: String,
//             enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
//             default: 'pending'
//         },

//         notes: String
//     },
//     {
//         timestamps: true
//     }
// );

// /* ===========================
//    AUTO-GENERATE ORDER ID
//    (FIXED – NO next() BUG)
// =========================== */
// orderSchema.pre('validate', async function () {
//     if (this.isNew && !this.orderId) {
//         const lastOrder = await this.constructor
//             .findOne({ orderId: { $exists: true } })
//             .sort({ createdAt: -1 })
//             .select('orderId');

//         let nextNumber = 1001;

//         if (lastOrder?.orderId) {
//             const match = lastOrder.orderId.match(/ORD-(\d+)/);
//             if (match) {
//                 nextNumber = Number(match[1]) + 1;
//             }
//         }

//         this.orderId = `ORD-${nextNumber}`;
//         console.log('Generated orderId:', this.orderId);
//     }
// });

// /* ===========================
//    EXPORT MODEL
// =========================== */
// const Order = mongoose.model('Order', orderSchema);
// export default Order;

import mongoose from 'mongoose';

/* ===========================
   ORDER ITEM SCHEMA
=========================== */
const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },

        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        price: {
            type: Number,
            required: true
        }
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
            required: true
        },

        orderId: {
            type: String,
            unique: true,
            sparse: true   // 🔥 VERY IMPORTANT
        },

        items: {
            type: [orderItemSchema],
            required: true
        },

        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true }
        },

        paymentMethod: {
            type: String,
            required: true,
            enum: ['COD', 'BANK_TRANSFER']
        },

        paymentProof: {
            transactionId: String,
            screenshot: String,
            bankName: String
        },

        totalPrice: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
            default: 'pending'
        },

        notes: String
    },
    { timestamps: true }
);

/* ===========================
   AUTO ORDER ID GENERATION
=========================== */
orderSchema.pre('validate', async function () {
    if (this.isNew && !this.orderId) {
        const lastOrder = await this.constructor
            .findOne({ orderId: { $exists: true } })
            .sort({ createdAt: -1 })
            .select('orderId');

        let nextNumber = 1001;

        if (lastOrder?.orderId) {
            const match = lastOrder.orderId.match(/ORD-(\d+)/);
            if (match) {
                nextNumber = Number(match[1]) + 1;
            }
        }

        this.orderId = `ORD-${nextNumber}`;
        console.log('Generated orderId:', this.orderId);
    }
});

/* ===========================
   EXPORT
=========================== */
export default mongoose.model('Order', orderSchema);
