// models/Contractor.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const contractorSchema = new mongoose.Schema({
    // Basic Information
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
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false,
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[0-9]{10}$/, 'Invalid 10-digit phone number'],
    },

    // Company Information
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
    },
    contractorType: {
        type: String,
        enum: [
            'General Contractor',
            'Specialty Contractor',
            'Subcontractor',
            'Builder',
            'Civil Engineer',
            'Architect',
            'Interior Designer',
            'Landscaper'
        ],
        required: true,
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true,
    },
    experience: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    specialties: [{
        type: String,
        enum: [
            'Residential Construction',
            'Commercial Construction',
            'Industrial Construction',
            'Renovation',
            'Civil Works',
            'Electrical',
            'Plumbing',
            'Interior Design',
            'Landscaping',
            'Project Management'
        ]
    }],
    teamSize: {
        type: String,
        enum: ['1-5', '5-20', '20-50', '50+'],
        default: '1-5',
    },
    projectsCompleted: {
        type: Number,
        default: 0,
        min: 0,
    },

    // Business Details
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: {
            type: String,
            default: 'India',
        },
    },
    website: String,
    gstNumber: String,

    // Bank Details
    bankDetails: {
        accountNumber: String,
        accountName: String,
        bankName: String,
        ifscCode: String,
        upiId: String,
    },

    // Portfolio
    portfolio: [{
        title: String,
        description: String,
        category: String,
        client: String,
        location: String,
        year: Number,
        budget: Number,
        images: [String],
        status: {
            type: String,
            enum: ['completed', 'ongoing', 'upcoming'],
            default: 'completed',
        },
        likes: { type: Number, default: 0 },
        views: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
    }],

    // Ratings & Reviews
    ratings: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 },
        breakdown: {
            5: { type: Number, default: 0 },
            4: { type: Number, default: 0 },
            3: { type: Number, default: 0 },
            2: { type: Number, default: 0 },
            1: { type: Number, default: 0 },
        },
    },
    reviews: [{
        clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: Number,
        comment: String,
        project: String,
        clientName: String,
        createdAt: { type: Date, default: Date.now },
    }],

    // Status & Verification
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
        type: String,
        enum: ['pending', 'under_review', 'verified', 'rejected'],
        default: 'pending',
    },
    verificationDocuments: {
        license: String,
        aadhar: String,
        pan: String,
        gst: String,
    },
    isActive: { type: Boolean, default: true },

    // Analytics
    profileViews: { type: Number, default: 0 },
    portfolioViews: { type: Number, default: 0 },
    quoteRequests: { type: Number, default: 0 },

    // Security
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    lastLogin: Date,
}, {
    timestamps: true,
});

// FIXED: Modern Mongoose way - No 'next' parameter needed
contractorSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
contractorSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
contractorSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

const Contractor = mongoose.model('Contractor', contractorSchema);

export default Contractor;