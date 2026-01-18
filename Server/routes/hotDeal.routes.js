import express from 'express';
import {
    requestHotDeal,
    sellerHotDealStatus,
    // createHotDealPayment,
    getHotDealRequests,
    approveHotDeal,
    rejectHotDeal,
    getHotDeals,
    trackHotDealView,
    trackHotDealClick
} from '../controllers/hotDeal.controller.js';

import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

/* ================= SELLER ================= */
router.put(
    '/request/:productId',
    protect,
    authorize('SELLER'),
    requestHotDeal
);

router.get(
    '/status',
    protect,
    authorize('SELLER'),
    sellerHotDealStatus
);

// router.post(
//     '/payment',
//     protect,
//     authorize('SELLER'),
//     createHotDealPayment
// );

/* ================= ADMIN ================= */
router.get(
    '/requests',
    protect,
    authorize('ADMIN'),
    getHotDealRequests
);

router.put(
    '/approve/:productId',
    protect,
    authorize('ADMIN'),
    approveHotDeal
);

router.put(
    '/reject/:productId',
    protect,
    authorize('ADMIN'),
    rejectHotDeal
);

/* ================= USER ================= */
router.get('/', getHotDeals);
router.post('/view/:productId', trackHotDealView);
router.post('/click/:productId', trackHotDealClick);

export default router;
