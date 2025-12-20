import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
    getUserProfile,
    updateUserProfile,
    getAddresses,
    addAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress
} from '../controllers/user.controller.js';

const router = express.Router();

// =====================
// USER PROFILE
// =====================
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// =====================
// USER ADDRESSES
// =====================
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.patch('/addresses/:addressId/default', protect, setDefaultAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

export default router;