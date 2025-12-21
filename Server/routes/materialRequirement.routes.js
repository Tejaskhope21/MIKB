// routes/materialRequirement.routes.js
import express from 'express';
import {
    createRequirement,
    getMyRequirements,
    getRequirementById,
    updateRequirement,
    cancelRequirement,
    getAllRequirements,
    acceptRequirement,
    rejectRequirement,
    assignToSeller,
    getRequirementsStats,
    addQuote,
    acceptQuote,
    getSellerAssignedRequirements,
    updateRequirementStatus,
    deleteMaterialRequirement
} from '../controllers/materialRequirement.controller.js';
import { protect, authorize, checkActive } from '../middleware/auth.middleware.js';

const router = express.Router();

/* ================= USER ROUTES ================= */
router.post('/', protect, checkActive, createRequirement);
router.get('/my', protect, checkActive, getMyRequirements);
router.get('/:id', protect, checkActive, getRequirementById);
router.put('/:id', protect, checkActive, updateRequirement);
router.patch('/:id/cancel', protect, checkActive, cancelRequirement);
router.delete('/:id', protect,checkActive, deleteMaterialRequirement); 

/* ================= SELLER ROUTES ================= */
router.get('/seller/assigned', protect, checkActive, authorize('SELLER'), getSellerAssignedRequirements);
router.post('/:id/quotes', protect, checkActive, authorize('SELLER'), addQuote);
router.patch('/:id/quotes/:quoteId/accept', protect, checkActive, authorize('SELLER'), acceptQuote);

/* ================= ADMIN ROUTES ================= */
router.get('/', protect, checkActive, authorize('ADMIN', 'SUPER_ADMIN'), getAllRequirements);
router.patch('/:id/accept', protect, checkActive, authorize('ADMIN', 'SUPER_ADMIN'), acceptRequirement);
router.patch('/:id/reject', protect, checkActive, authorize('ADMIN', 'SUPER_ADMIN'), rejectRequirement);
router.patch('/:id/assign', protect, checkActive, authorize('ADMIN', 'SUPER_ADMIN'), assignToSeller);
router.patch('/:id/status', protect, checkActive, authorize('ADMIN', 'SUPER_ADMIN'), updateRequirementStatus);
router.get('/stats/overview', protect, checkActive, authorize('ADMIN', 'SUPER_ADMIN'), getRequirementsStats);

export default router;