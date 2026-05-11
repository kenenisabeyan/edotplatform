require('dotenv').config({ path: './.env' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function listVideos() {
  try {
    const result = await cloudinary.search
      .expression('resource_type:video')
      .with_field('context')
      .sort_by('created_at','desc')
      .max_results(20)
      .execute();
    
    console.log('Found ' + result.resources.length + ' videos:');
    result.resources.forEach(r => {
      console.log(r.public_id + ' -> ' + r.secure_url + ' | original_filename: ' + r.filename);
    });
  } catch(e) {
    console.log('Error fetching from Cloudinary:', e.message || e);
  }
}
listVideos();
