require('dotenv').config({ path: './.env' });
const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function run() {
  const filePath = path.join(__dirname, '../../frontend/src/assets/Qano 1.mov');
  console.log('Uploading "Qano 1.mov" to Cloudinary...');
  
  try {
    const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(filePath, {
            folder: 'edot/frontend/videos',
            resource_type: 'video',
            chunk_size: 6000000, // 6MB chunks
            public_id: 'qano_1_mov'
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
