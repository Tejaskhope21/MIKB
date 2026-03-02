import express from 'express';
import {
    userRegister,
    userLogin,
    sellerRegister,
    sellerLogin,
    adminLogin,
    adminRegister,
    getMe
} from '../controllers/auth.controller.js';

import {
    protect,
    checkActive
} from '../middleware/auth.middleware.js';

import {
    validate,
    registerValidation,
    sellerRegisterValidation
} from '../middleware/validation.middleware.js';

const router = express.Router();

/* =======================
   PUBLIC ROUTES
======================= */

// USER AUTH
router.post(
    '/user/register',
    validate(registerValidation),
    userRegister
);

router.post(
    '/user/login',
    userLogin
);

// SELLER AUTH
router.post(
    '/seller/register',
    validate([...registerValidation, ...sellerRegisterValidation]),
    sellerRegister
);

router.post(
    '/seller/login',
    sellerLogin
);

// ADMIN AUTH
router.post(
    '/admin/login',
    adminLogin
);

router.post(
    '/admin/register',
    adminRegister
);

/* =======================
   PROTECTED ROUTES
======================= */

// GET CURRENT USER (USER / SELLER / ADMIN)
router.get(
    '/me',
    protect,        // ✅ middleware (DO NOT CALL)
    checkActive,    // ✅ middleware (DO NOT CALL)
    getMe
);

export default router;
