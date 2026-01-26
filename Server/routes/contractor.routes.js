// routes/contractor/contractor.routes.js
import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js'
import {
    getContractorPortfolio,
    addPortfolioProject,
    updatePortfolioProject,
    deletePortfolioProject,
    getAllContractors,
    getContractorById,
    getPortfolioProjectById,
    getContractorStats,
    verifyContractor,
    unverifyContractor,
    deleteContractor,
    getPortfolioProjects
} from '../controllers/contractor.controller.js'

import {
    filterContractors
} from '../controllers/contractor.controller.js'
const router = express.Router();

// Public routes
router.get('/', getAllContractors);
router.get('/:id', getContractorById);

// ===== FILTER ROUTES =====
router.get('/filter/all', filterContractors); // All filters combined


// Contractor portfolio routes (protected)
router.get('/portfolio/projects', protect, authorize('contractor'), getPortfolioProjects);
router.get('/portfolio/projects/:projectId', protect, authorize('contractor'), getPortfolioProjectById);
router.post('/portfolio/projects', protect, authorize('contractor'), addPortfolioProject);
router.put('/portfolio/projects/:projectId', protect, authorize('contractor'), updatePortfolioProject);
router.delete('/portfolio/projects/:projectId', protect, authorize('contractor'), deletePortfolioProject);
router.get('/stats/dashboard', protect, authorize('contractor'), getContractorStats);

//Admin
// ✅ Verify contractor
router.put(
  '/contractors/:id/verify',
  protect,
  authorize('admin'),
  verifyContractor
);

//  Unverify / Reject contractor
router.put(
  '/contractors/:id/unverify',
  protect,
  authorize('admin'),
  unverifyContractor
);

// 🗑 Delete contractor
router.delete(
  '/contractors/:id',
  protect,
  authorize('admin'),
  deleteContractor
);

export default router; 