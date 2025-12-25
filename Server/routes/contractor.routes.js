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
    addContractorReview,
    updateContractorAnalytics,
    getContractorStats
} from '../controllers/contractor.controller.js'

import {
    filterContractors,
    getContractorsByRating,
    getContractorsByExperience,
    getContractorsByLocation,
    getContractorsBySpecialty,
    getVerifiedContractors,
    getContractorsWithPortfolio,
    getFilterOptions,
    getContractorRatings
} from '../controllers/contractor.controller.js'
const router = express.Router();

// Public routes
router.get('/', getAllContractors);
router.get('/:id', getContractorById);

// ===== FILTER ROUTES =====
router.get('/filter/all', filterContractors); // All filters combined
router.get('/filter/rating', getContractorsByRating);
router.get('/filter/experience', getContractorsByExperience);
router.get('/filter/location', getContractorsByLocation);
router.get('/filter/specialty', getContractorsBySpecialty);
router.get('/filter/verified', getVerifiedContractors);
router.get('/filter/with-portfolio', getContractorsWithPortfolio);
router.get('/filter/options', getFilterOptions);

// Contractor portfolio routes (protected)
router.get('/portfolio/projects', protect, authorize('contractor'), getContractorPortfolio);
router.post('/portfolio/projects', protect, authorize('contractor'), addPortfolioProject);
router.put('/portfolio/projects/:projectId', protect, authorize('contractor'), updatePortfolioProject);
router.delete('/portfolio/projects/:projectId', protect, authorize('contractor'), deletePortfolioProject);

// Contractor stats (protected)
router.get('/stats/dashboard', protect, authorize('contractor'), getContractorStats);
router.put('/analytics/view', protect, authorize('contractor'), updateContractorAnalytics);

// Reviews (protected - users only)
router.get('/:id/ratings', getContractorRatings);

// Protected review route (already there)
router.post('/:id/reviews', protect, authorize('user'), addContractorReview);

export default router;