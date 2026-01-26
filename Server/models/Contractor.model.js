import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const contractorSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  phone: { type: String, required: true },

  // Company Info
  companyName: { type: String, required: true },
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
    required: true
  },
  licenseNumber: { type: String, required: true, unique: true },
  experience: { type: Number, default: 1 },
  specialties: [String],
  teamSize: { type: String, default: '1-5' },
  projectsCompleted: { type: Number, default: 0 },

  // Address
  address: {
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },

  // Portfolio
  portfolio: [{
    title: String,
    description: String,
    category: String,
    location: String,
    year: Number,
    images: [String],
    status: { type: String, enum: ['completed', 'ongoing'] }
  }],

  // Verification
  isVerified: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },

  isActive: { type: Boolean, default: true },

  // Analytics
  profileViews: { type: Number, default: 0 },
  portfolioViews: { type: Number, default: 0 },

  // Security
  resetPasswordToken: String,
  resetPasswordExpire: Date

}, { timestamps: true });

// Password hash
contractorSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

contractorSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model('Contractor', contractorSchema);
