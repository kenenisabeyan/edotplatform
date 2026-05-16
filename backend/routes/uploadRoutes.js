import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();


const upload = multer({ 
    dest: os.tmpdir(),
    limits: { fileSize: 1000000000 } // 1GB Limit
});

router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const result = await new Promise((resolve, reject) => {
            const isVideo = req.file.mimetype.startsWith('video');
            const folder = isVideo ? 'edot/videos' : 'edot/images';
            
            cloudinary.uploader.upload_large(req.file.path, {
                folder: folder,
                resource_type: 'auto',
                type: isVideo ? 'authenticated' : 'upload',
                chunk_size: 6000000 // 6MB chunks to avoid payload size limit
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        try {
            fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
            console.error('Failed to clean up temp file:', unlinkErr);
        }

        const isVideo = req.file.mimetype.startsWith('video');
        const optimizedUrl = cloudinary.url(result.public_id, {
            resource_type: isVideo ? 'video' : 'image',
            secure: true,
            fetch_format: 'auto',
            quality: 'auto'
        });

        res.json({
            success: true,
            secure_url: optimizedUrl,
            filePath: optimizedUrl,
            raw_url: result.secure_url,
            public_id: result.public_id,
            duration: result.duration || 0
        });
    } catch (error) {
        console.error('Upload error:', error);
        
        if (req.file && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkErr) {
                console.error('Failed to clean up temp file on error:', unlinkErr);
            }
        }

        res.status(500).json({ success: false, message: error.message || 'Server error during upload' });
    }
});

export default router;
