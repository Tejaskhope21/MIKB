import express from 'express';
import { protect } from '../middleware/auth.middleware.js';

// ✅ DEFAULT + NAMED import (must match exactly)
import upload, { uploadToCloudinary } from '../middleware/upload.middleware.js';

const router = express.Router();

// Single image
router.post(
    '/',
    protect,
    upload.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No image uploaded',
                });
            }

            const result = await uploadToCloudinary(req.file.buffer);

            res.json({
                success: true,
                imageUrl: result.secure_url,
                publicId: result.public_id,
            });
        } catch (err) {
            console.error('Upload error:', err);
            res.status(500).json({
                success: false,
                message: err.message || 'Upload failed',
            });
        }
    }
);

// Multiple images
router.post(
    '/multiple',
    protect,
    upload.array('images', 10),
    async (req, res) => {
        try {
            if (!req.files?.length) {
                return res.status(400).json({
                    success: false,
                    message: 'No images uploaded',
                });
            }

            const uploads = await Promise.all(
                req.files.map(file => uploadToCloudinary(file.buffer))
            );

            res.json({
                success: true,
                files: uploads.map(u => ({
                    imageUrl: u.secure_url,
                    publicId: u.public_id,
                })),
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Upload failed',
            });
        }
    }
);

export default router;
