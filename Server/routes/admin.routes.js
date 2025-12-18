import express from 'express';
import {
    getAllUsers,
    getAllSellers,
    verifySeller,
    toggleUserStatus,
    createAdmin,
    getStats
} from '../controllers/admin.controller.js';
import { protect, authorize, checkActive } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require ADMIN authentication
router.use(protect);
router.use(checkActive);
router.use(authorize('ADMIN'));

/* ================= STATS ================= */
router.get('/stats', getStats);

/* ================= USER MANAGEMENT ================= */
router.get('/users', getAllUsers);
router.patch('/users/:userId/status', toggleUserStatus);

/* ================= SELLER MANAGEMENT ================= */
router.get('/sellers', getAllSellers);
router.patch('/sellers/:sellerId/verify', verifySeller);

/* ================= ADMIN MANAGEMENT ================= */
router.post('/admins', createAdmin);

export default router;