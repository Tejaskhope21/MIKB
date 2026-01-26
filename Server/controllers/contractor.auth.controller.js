// controllers/contractor/auth.contractor.controller.js
import Contractor from '../models/Contractor.model.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register contractor
// @route   POST /api/contractor/auth/register
// @access  Public
export const registerContractor = async (req, res) => {
  try {
    const contractor = await Contractor.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Contractor registered successfully. Awaiting admin verification.',
      data: contractor
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// @desc    Login contractor
// @route   POST /api/contractor/auth/login
// @access  Public
export const loginContractor = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for contractor
        const contractor = await Contractor.findOne({ email }).select('+password');

        if (!contractor) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordMatch = await contractor.matchPassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if contractor is active
        if (!contractor.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Update last login
        contractor.lastLogin = new Date();
        await contractor.save();

        const token = generateToken(contractor._id, 'contractor');

        res.json({
            success: true,
            message: 'Login successful',
            token,
            contractor: {
                _id: contractor._id,
                name: contractor.name,
                email: contractor.email,
                phone: contractor.phone,
                companyName: contractor.companyName,
                contractorType: contractor.contractorType,
                experience: contractor.experience,
                licenseNumber: contractor.licenseNumber,
                specialties: contractor.specialties,
                teamSize: contractor.teamSize,
                isVerified: contractor.isVerified,
                verificationStatus: contractor.verificationStatus,
                profileViews: contractor.profileViews,
                portfolioViews: contractor.portfolioViews,
                projectsCompleted: contractor.projectsCompleted,
                ratings: contractor.ratings,
                portfolio: contractor.portfolio || [],
                address: contractor.address
            }
        });
    } catch (error) {
        console.error('Contractor login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get contractor profile
// @route   GET /api/contractor/auth/profile
// @access  Private (Contractor only)
export const getContractorProfile = async (req, res) => {
    try {
        const contractor = await Contractor.findById(req.user.id)
            .select('-password -resetPasswordToken -resetPasswordExpire');

        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: 'Contractor not found'
            });
        }

        // Increment profile views
        contractor.profileViews += 1;
        await contractor.save();

        res.json({
            success: true,
            contractor
        });
    } catch (error) {
        console.error('Get contractor profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Update contractor profile
// @route   PUT /api/contractor/auth/profile
// @access  Private (Contractor only)
export const updateContractorProfile = async (req, res) => {
    try {
        const contractor = await Contractor.findById(req.user.id);

        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: 'Contractor not found'
            });
        }

        // Update fields
        const allowedUpdates = [
            'name', 'phone', 'companyName', 'contractorType',
            'experience', 'specialties', 'teamSize', 'address',
            'website', 'gstNumber', 'bankDetails', 'verificationDocuments'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                contractor[field] = req.body[field];
            }
        });

        // Handle specialties array
        if (req.body.specialties && Array.isArray(req.body.specialties)) {
            contractor.specialties = req.body.specialties;
        }

        // Update verification status if documents are uploaded
        if (req.body.verificationDocuments) {
            contractor.verificationStatus = 'under_review';
        }

        const updatedContractor = await contractor.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            contractor: {
                _id: updatedContractor._id,
                name: updatedContractor.name,
                email: updatedContractor.email,
                phone: updatedContractor.phone,
                companyName: updatedContractor.companyName,
                contractorType: updatedContractor.contractorType,
                experience: updatedContractor.experience,
                specialties: updatedContractor.specialties,
                teamSize: updatedContractor.teamSize,
                address: updatedContractor.address,
                website: updatedContractor.website,
                isVerified: updatedContractor.isVerified,
                verificationStatus: updatedContractor.verificationStatus,
                profileViews: updatedContractor.profileViews
            }
        });
    } catch (error) {
        console.error('Update contractor profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Update contractor password
// @route   PUT /api/contractor/auth/password
// @access  Private (Contractor only)
export const updateContractorPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        const contractor = await Contractor.findById(req.user.id).select('+password');

        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: 'Contractor not found'
            });
        }

        // Check current password
        const isPasswordMatch = await contractor.matchPassword(currentPassword);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        contractor.password = newPassword;
        await contractor.save();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};