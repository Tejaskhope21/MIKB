// routes/contractor/auth.contractor.routes.js
import express from 'express';
import {
    registerContractor,
    loginContractor,
    getContractorProfile,
    updateContractorProfile,
    updateContractorPassword
} from '../controllers/contractor.auth.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerContractor);
router.post('/login', loginContractor);

// Protected routes
router.get('/profile', protect, authorize('contractor'), getContractorProfile);
router.put('/profile', protect, authorize('contractor'), updateContractorProfile);
router.put('/password', protect, authorize('contractor'), updateContractorPassword);

export default router;