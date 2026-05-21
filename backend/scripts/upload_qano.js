import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function run() {
  const filePath = path.join(__dirname, '../frontend/src/assets/Qano_smaller.mp4');
  console.log('Uploading Qano.mp4 to Cloudinary...');
  
  try {
    const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(filePath, {
            folder: 'edot/frontend/videos',
            resource_type: 'video',
            chunk_size: 6000000, // 6MB chunks
        }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
    });
    
    const optimizedUrl = cloudinary.url(result.public_id, {
        resource_type: 'video',
        secure: true,
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    console.log('SUCCESS_URL:', optimizedUrl);
  } catch (error) {
    console.error('FAILED:', error);
  }
}

run();
