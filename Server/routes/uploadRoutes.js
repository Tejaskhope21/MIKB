import express from 'express';
import upload from '../middleware/cloudinaryUpload.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Single image upload
router.post('/', protect, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image uploaded',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: req.file.path,      // Cloudinary secure URL
            publicId: req.file.filename,  // Cloudinary public_id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Upload failed',
            error: error.message,
        });
    }
});

// Multiple images upload
router.post('/multiple', protect, upload.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No images uploaded',
            });
        }

        const files = req.files.map((file) => ({
            imageUrl: file.path,
            publicId: file.filename,
        }));

        res.status(200).json({
            success: true,
            message: 'Images uploaded successfully',
            files,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Multiple upload failed',
        });
    }
});

export default router;
