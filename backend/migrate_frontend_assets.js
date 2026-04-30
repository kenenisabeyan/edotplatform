import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ASSETS_DIR = path.join(__dirname, '../frontend/src/assets');
const SRC_DIR = path.join(__dirname, '../frontend/src');

async function uploadToCloudinary(filePath, fileName) {
  const isVideo = fileName.endsWith('.mp4') || fileName.endsWith('.webm');
  const folder = isVideo ? 'edot/frontend/videos' : 'edot/frontend/images';
  
  try {
    const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(filePath, {
            folder,
            resource_type: 'auto',
            chunk_size: 6000000,
            timeout: 300000 // 5 minutes
        }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
    });
    
    const optimizedUrl = cloudinary.url(result.public_id, {
        resource_type: isVideo ? 'video' : 'image',
        secure: true,
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    return optimizedUrl;
  } catch (err) {
    console.error(`Failed to upload ${fileName}:`, err);
    return null;
  }
}

function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, filesList);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      filesList.push(filePath);
    }
  }
  return filesList;
}

async function run() {
  console.log('Starting frontend asset migration...');
  const assetFiles = fs.readdirSync(ASSETS_DIR);
  const uploadedUrls = {};

  for (const file of assetFiles) {
    if (file.endsWith('.svg')) continue;
    
    const filePath = path.join(ASSETS_DIR, file);
    if (!fs.statSync(filePath).isFile()) continue;
    
    console.log(`Uploading ${file}...`);
    const url = await uploadToCloudinary(filePath, file);
    if (url) {
      uploadedUrls[file] = url;
      console.log(`Uploaded ${file} -> ${url}`);
    }
  }

  console.log('\nUpdating React files...');
  const reactFiles = getFiles(SRC_DIR);
  
  for (const file of reactFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    for (const [assetName, url] of Object.entries(uploadedUrls)) {
      const regex = new RegExp(`import\\s+([a-zA-Z0-9_]+)\\s+from\\s+['"](?:\\.\\./)+assets/${assetName}['"];?`, 'g');
      
      if (regex.test(content)) {
        content = content.replace(regex, `const $1 = '${url}';`);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated imports in ${path.basename(file)}`);
    }
  }

  console.log('\nDeleting migrated local assets...');
  for (const assetName of Object.keys(uploadedUrls)) {
    const filePath = path.join(ASSETS_DIR, assetName);
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted ${assetName}`);
    } catch(e) {
      console.log(`Failed to delete ${assetName}`, e);
    }
  }
  
  console.log('\nDone! All large assets migrated to Cloudinary.');
}

run();
