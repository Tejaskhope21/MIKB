import express from 'express';
import {
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getAddresses,
    updateProfile
} from '../controllers/user.controller.js';
import { protect, authorize, checkActive } from '../middleware/auth.middleware.js';
import { validate, addressValidation } from '../middleware/validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(checkActive);
router.use(authorize('USER'));

/* ================= PROFILE ================= */
router.put('/profile', updateProfile);

/* ================= ADDRESSES ================= */
router.get('/addresses', getAddresses);
router.post('/addresses', validate(addressValidation), addAddress);
router.put('/addresses/:addressId', validate(addressValidation), updateAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.patch('/addresses/:addressId/default', setDefaultAddress);

export default router;