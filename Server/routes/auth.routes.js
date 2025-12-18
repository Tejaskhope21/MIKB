import express from 'express';
import {
    userRegister,
    userLogin,
    sellerRegister,
    sellerLogin,
    adminLogin,
    getMe
} from '../controllers/auth.controller.js';
import { protect, authorize, checkActive } from '../middleware/auth.middleware.js';
import {
    validate,
    registerValidation,
    sellerRegisterValidation
} from '../middleware/validation.middleware.js';

const router = express.Router();

/* ================= PUBLIC ROUTES ================= */

// USER AUTH
router.post('/user/register', validate(registerValidation), userRegister);
router.post('/user/login', userLogin);

// SELLER AUTH
router.post('/seller/register', validate([...registerValidation, ...sellerRegisterValidation]), sellerRegister);
router.post('/seller/login', sellerLogin);

// ADMIN AUTH
router.post('/admin/login', adminLogin);

/* ================= PROTECTED ROUTES ================= */

// GET CURRENT USER (ALL ROLES)
router.get('/me', protect, checkActive, getMe);

export default router;