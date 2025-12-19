import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/* =========================
   USER SCHEMA
========================= */

const userSchema = new mongoose.Schema(
    {
        /* ===== BASIC INFO ===== */
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Invalid email',
            ],
        },

        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: false,
        },

        role: {
            type: String,
            enum: ['USER', 'SELLER', 'ADMIN', 'SUPER_ADMIN'],
            default: 'USER',
        },

        phone: {
            type: String,
            match: [/^[0-9]{10}$/, 'Invalid 10-digit phone number'],
        },

        profileImage: {
            type: String,
        },

        /* ===== ADDRESSES ===== */
        addresses: [
            {
                fullName: { type: String, required: true },
                phone: { type: String, required: true },
                addressLine: { type: String, required: true },
                city: { type: String, required: true },
                state: { type: String, required: true },
                pincode: {
                    type: String,
                    required: true,
                    match: [/^[0-9]{6}$/, 'Invalid pincode'],
                },
                country: { type: String, default: 'India' },
                addressType: {
                    type: String,
                    enum: ['home', 'office', 'other'],
                    default: 'home',
                },
                isDefault: { type: Boolean, default: false },
            },
        ],

        /* ===== SELLER INFO ===== */
        businessName: {
            type: String,
        },

        sellerSettings: {
            storeName: String,
            storeSlug: {
                type: String,
                unique: true,
                sparse: true,
                lowercase: true,
            },
            storeLogo: String,
            storeBanner: String,
            isStorePublished: {
                type: Boolean,
                default: false,
            },
            storeStatus: {
                type: String,
                enum: ['active', 'inactive', 'suspended', 'under_review'],
                default: 'under_review',
            },
            default: {},
        },

        /* ===== STATUS & VERIFICATION ===== */
        isEmailVerified: { type: Boolean, default: false },
        isPhoneVerified: { type: Boolean, default: false },
        isSellerVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },

        /* ===== SECURITY ===== */
        resetPasswordToken: { type: String, select: false },
        resetPasswordExpire: { type: Date, select: false },

        loginAttempts: { type: Number, default: 0, select: false },
        lockUntil: { type: Date, select: false },

        /* ===== WALLET (SELLER) ===== */
        wallet: {
            balance: { type: Number, default: 0, min: 0 },
            pendingBalance: { type: Number, default: 0, min: 0 },
            lifetimeEarnings: { type: Number, default: 0, min: 0 },
        },

        /* ===== REFERRAL ===== */
        referralCode: {
            type: String,
            unique: true,
            sparse: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

/* =========================
   PRE-SAVE MIDDLEWARE
========================= */
userSchema.pre('save', async function () {
    // Hash password
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    // Generate referral code for USER
    if (this.role === 'USER' && !this.referralCode) {
        this.referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    }

    // Generate store slug for SELLER
    if (
        this.role === 'SELLER' &&
        this.businessName &&
        !this.sellerSettings?.storeSlug
    ) {
        this.sellerSettings.storeSlug = this.businessName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
});

/* =========================
   QUERY MIDDLEWARE (NO next)
========================= */
userSchema.pre(/^find/, function () {
    this.where({ deletedAt: { $exists: false } });
});

/* =========================
   INSTANCE METHODS
========================= */
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

/* =========================
   MODEL EXPORT
========================= */
const User = mongoose.model('User', userSchema);
export default User;
