import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// Memory storage (Vercel-safe)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif/;
        const isValid =
            allowed.test(file.mimetype) &&
            allowed.test(file.originalname.toLowerCase());

        if (isValid) return cb(null, true);
        cb(new Error('Only image files are allowed'));
    },
});

// ✅ NAMED EXPORT (this MUST exist)
export const uploadToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'bricks-products',
                resource_type: 'image',
                ...options,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// ✅ DEFAULT EXPORT
export default upload;
