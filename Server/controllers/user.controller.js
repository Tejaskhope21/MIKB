import User from '../models/User.model.js';

// =====================
// GET USER PROFILE
// =====================
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// =====================
// UPDATE USER PROFILE
// =====================
export const updateUserProfile = async (req, res, next) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            req.body,
            { new: true }
        ).select('-password');

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        next(error);
    }
};

// =====================
// GET ADDRESSES
// =====================
export const getAddresses = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('addresses');

        res.json({
            success: true,
            addresses: user.addresses || []
        });
    } catch (error) {
        next(error);
    }
};

// =====================
// ADD ADDRESS
// =====================
export const addAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        user.addresses.push(req.body);
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            addresses: user.addresses
        });
    } catch (error) {
        next(error);
    }
};

// =====================
// UPDATE ADDRESS
// =====================
export const updateAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user.id);

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        Object.assign(address, req.body);
        await user.save();

        res.json({
            success: true,
            message: 'Address updated',
            addresses: user.addresses
        });
    } catch (error) {
        next(error);
    }
};

// =====================
// SET DEFAULT ADDRESS
// =====================
export const setDefaultAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user.id);

        // Reset all addresses to not default
        user.addresses.forEach(addr => {
            addr.isDefault = false;
        });

        // Set the selected address as default
        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        address.isDefault = true;
        await user.save();

        res.json({
            success: true,
            message: 'Default address updated',
            addresses: user.addresses
        });
    } catch (error) {
        next(error);
    }
};

// =====================
// DELETE ADDRESS
// =====================
export const deleteAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user.id);

        user.addresses = user.addresses.filter(
            addr => addr._id.toString() !== addressId
        );

        await user.save();

        res.json({
            success: true,
            message: 'Address deleted',
            addresses: user.addresses
        });
    } catch (error) {
        next(error);
    }
};