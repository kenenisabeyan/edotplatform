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
  const assetsDir = path.join(__dirname, '../../frontend/src/assets');
  const filesToUpload = [
    { name: 'kenenisa.png', type: 'image' },
    { name: 'fayda.jpg', type: 'image' },
    { name: 'fayida.jpg', type: 'image' },
    { name: 'ai.pdf', type: 'raw' },
    { name: 'data.pdf', type: 'raw' },
    { name: 'developer.pdf', type: 'raw' },
    { name: 'prog.pdf', type: 'raw' },
    { name: 'prog.zip', type: 'raw' }
  ];

  const results = {};

  for (const file of filesToUpload) {
    const filePath = path.join(assetsDir, file.name);
    if (!fs.existsSync(filePath)) continue;

    console.log(`Uploading ${file.name}...`);
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'edot/frontend/assets',
        resource_type: file.type
      });
      console.log(`SUCCESS: ${result.secure_url}`);
      results[file.name] = result.secure_url;
    } catch (error) {
      console.error(`FAILED to upload ${file.name}:`, error);
    }
  }

  // Also print the video URL
  console.log('\n--- Cloudinary URLs ---');
  console.log('Qano_smaller.mp4: https://res.cloudinary.com/dacck6udl/video/upload/f_auto,q_auto/v1/edot/frontend/videos/gdlfwv5gzcoe3zatet5m');
  for (const [name, url] of Object.entries(results)) {
    console.log(`${name}: ${url}`);
  }
}

run();
