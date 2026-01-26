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


/* =====================================================
   @desc    Get contractor profile
   @route   GET /api/contractor/auth/profile
   @access  Private (Contractor)
===================================================== */
export const getContractorProfile = async (req, res) => {
  try {
    const contractor = await Contractor.findByIdAndUpdate(
      req.user.id,
      { $inc: { profileViews: 1 } }, // atomic increment
      { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpire');

    if (!contractor) {
      return res.status(404).json({
        success: false,
        message: 'Contractor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: contractor,
    });
  } catch (error) {
    console.error('Get contractor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/* =====================================================
   @desc    Update contractor profile
   @route   PUT /api/contractor/auth/profile
   @access  Private (Contractor)
===================================================== */
export const updateContractorProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'name',
      'phone',
      'companyName',
      'contractorType',
      'experience',
      'specialties',
      'teamSize',
      'address',
      'website',
      'gstNumber',
      'bankDetails',
      'verificationDocuments',
    ];

    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // If documents uploaded → set verification to review
    if (req.body.verificationDocuments) {
      updates.verificationStatus = 'under_review';
      updates.isVerified = false;
    }

    const contractor = await Contractor.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!contractor) {
      return res.status(404).json({
        success: false,
        message: 'Contractor not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: contractor,
    });
  } catch (error) {
    console.error('Update contractor profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/* =====================================================
   @desc    Update contractor password
   @route   PUT /api/contractor/auth/password
   @access  Private (Contractor)
===================================================== */
export const updateContractorPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    const contractor = await Contractor.findById(req.user.id).select('+password');

    if (!contractor) {
      return res.status(404).json({
        success: false,
        message: 'Contractor not found',
      });
    }

    const isMatch = await contractor.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    contractor.password = newPassword;
    await contractor.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
