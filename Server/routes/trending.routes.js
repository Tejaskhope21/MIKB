import express from 'express';
import {
    requestTrending,
    sellerTrendingStatus,
    getTrendingRequests,
    approveTrending,
    rejectTrending,
    getTrendingProducts,
    trackTrendingView,
    trackTrendingClick
} from '../controllers/trending.controller.js';

import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

/* ========== SELLER ========== */
router.put(
    '/request/:productId',
    protect,
    authorize('SELLER'),
    requestTrending
);

router.get(
    '/status',
    protect,
    authorize('SELLER'),
    sellerTrendingStatus
);

/* ========== ADMIN ========== */
router.get(
    '/requests',
    protect,
    authorize('ADMIN'),
    getTrendingRequests
);

router.put(
    '/approve/:productId',
    protect,
    authorize('ADMIN'),
    approveTrending
);

router.put(
    '/reject/:productId',
    protect,
    authorize('ADMIN'),
    rejectTrending
);

/* ========== USER ========== */
router.get('/', getTrendingProducts);
router.post('/view/:productId', trackTrendingView);
router.post('/click/:productId', trackTrendingClick);

export default router;
