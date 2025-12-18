import { body, validationResult } from 'express-validator';

export const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({
            success: false,
            errors: errors.array()
        });
    };
};

/* Validation rules */
export const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

export const sellerRegisterValidation = [
    body('businessName').notEmpty().withMessage('Business name is required'),
    body('businessType').isIn(['Manufacturer', 'Distributor', 'Retailer', 'Wholesaler']).withMessage('Invalid business type'),
    body('gstNumber').matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).withMessage('Invalid GST Number'),
    body('contactNumber').matches(/^[0-9]{10}$/).withMessage('Invalid contact number')
];

export const addressValidation = [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Invalid phone number'),
    body('addressLine').notEmpty().withMessage('Address line is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('pincode').matches(/^[0-9]{6}$/).withMessage('Invalid pincode')
];