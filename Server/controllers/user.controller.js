import User from '../models/User.model.js';

/* ================= ADD USER ADDRESS ================= */
export const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const address = {
            ...req.body,
            isDefault: user.addresses.length === 0
        };

        user.addresses.push(address);
        await user.save();

        res.json({
            success: true,
            addresses: user.addresses,
            message: 'Address added successfully'
        });

    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= UPDATE ADDRESS ================= */
export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.userId);

        const addressIndex = user.addresses.findIndex(
            addr => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        user.addresses[addressIndex] = {
            ...user.addresses[addressIndex].toObject(),
            ...req.body
        };

        await user.save();

        res.json({
            success: true,
            addresses: user.addresses,
            message: 'Address updated successfully'
        });

    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= DELETE ADDRESS ================= */
export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.userId);

        user.addresses = user.addresses.filter(
            addr => addr._id.toString() !== addressId
        );

        await user.save();

        res.json({
            success: true,
            addresses: user.addresses,
            message: 'Address deleted successfully'
        });

    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= SET DEFAULT ADDRESS ================= */
export const setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.userId);

        user.addresses.forEach(addr => {
            addr.isDefault = addr._id.toString() === addressId;
        });

        await user.save();

        res.json({
            success: true,
            addresses: user.addresses,
            message: 'Default address updated'
        });

    } catch (error) {
        console.error('Set default address error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= GET USER ADDRESSES ================= */
export const getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('addresses');

        res.json({
            success: true,
            addresses: user.addresses
        });

    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/* ================= UPDATE USER PROFILE ================= */
export const updateProfile = async (req, res) => {
    try {
        const updates = req.body;

        // Remove restricted fields
        delete updates.role;
        delete updates.password;
        delete updates.isSellerVerified;

        const user = await User.findByIdAndUpdate(
            req.userId,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            user,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};