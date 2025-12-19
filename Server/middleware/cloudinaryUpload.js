import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Cloudinary storage config
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        let folder = 'general';

        if (file.fieldname.includes('image') || file.fieldname === 'images') {
            folder = 'products';
        } else if (file.fieldname.includes('logo') || file.fieldname.includes('banner')) {
            folder = 'store';
        } else if (file.fieldname.includes('certificate')) {
            folder = 'documents';
        }

        return {
            folder: `buildersmart/${folder}`,
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        };
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const ext = allowedTypes.test(file.originalname.toLowerCase());
    const mime = allowedTypes.test(file.mimetype);

    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files are allowed'));
};

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter,
});

export default upload;
