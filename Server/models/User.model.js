// models/User.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/* USER ADDRESS SUB-SCHEMA */
const addressSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
        },
        addressLine: {
            type: String,
            required: [true, 'Address line is required'],
            trim: true,
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true,
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true,
        },
        pincode: {
            type: String,
            required: [true, 'Pincode is required'],
            match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode'],
        },
        country: {
            type: String,
            default: 'India',
            trim: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    { _id: true } // Each address gets its own _id
);

/* MAIN USER SCHEMA */
const userSchema = new mongoose.Schema(
    {
        /* COMMON FIELDS */
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default
        },
        role: {
            type: String,
            enum: ['USER', 'SELLER', 'ADMIN'],
            default: 'USER',
        },
        phone: {
            type: String,
            match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
        },

        /* USER SPECIFIC */
        addresses: [addressSchema],

        /* SELLER SPECIFIC FIELDS */
        businessName: { type: String, trim: true },
        businessType: {
            type: String,
            enum: ['Manufacturer', 'Distributor', 'Retailer', 'Wholesaler', null],
        },
        gstNumber: {
            type: String,
            uppercase: true,
            trim: true,
            match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST Number'],
        },
        businessAddress: { type: String, trim: true },
        businessCity: { type: String, trim: true },
        businessState: { type: String, trim: true },
        businessPincode: {
            type: String,
            match: [/^[0-9]{6}$/, 'Invalid pincode'],
        },
        contactNumber: {
            type: String,
            match: [/^[0-9]{10}$/, 'Invalid contact number'],
        },
        bankAccountName: { type: String, trim: true },
        bankAccountNumber: {
            type: String,
            match: [/^[0-9]{9,18}$/, 'Invalid account number'],
        },
        bankIFSC: {
            type: String,
            uppercase: true,
            trim: true,
            match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'],
        },
        isSellerVerified: {
            type: Boolean,
            default: false,
        },

        /* COMMON META */
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: Date,
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

/* HASH PASSWORD BEFORE SAVING - MODERN ASYNC STYLE (Mongoose 7/8+) */
userSchema.pre('save', async function () {
    // Only hash if password is modified (or new)
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/* METHOD TO COMPARE PASSWORD DURING LOGIN */
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

/* EXPORT MODEL */
const User = mongoose.model('User', userSchema);

export default User;