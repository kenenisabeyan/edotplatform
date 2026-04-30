import { prisma } from './lib/prisma.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
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

async function uploadToCloudinary(localPath, isVideo = false) {
    if (!fs.existsSync(localPath)) {
        console.log(`File not found: ${localPath}. Returning placeholder.`);
        // Return a default Cloudinary placeholder URL to ensure the DB is migrated off local paths.
        if (isVideo) {
            return 'https://res.cloudinary.com/dacck6udl/video/upload/v1776430633/edot_uploads/iwis1ntevrzybud3di11.mp4';
        } else {
            return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';
        }
    }
    try {
        const folder = isVideo ? 'edot/videos' : 'edot/images';
        const result = await cloudinary.uploader.upload_large(localPath, {
            folder,
            resource_type: 'auto',
            chunk_size: 6000000
        });
        return result.secure_url;
    } catch (error) {
        console.error(`Failed to upload ${localPath}:`, error);
        return null;
    }
}

function getLocalPath(url) {
    if (!url) return null;
    if (url.startsWith('http') && !url.includes('localhost')) return null; // Already cloud or external
    
    // Extract filename from /uploads/filename.ext or http://localhost:5000/uploads/filename.ext
    let filename = '';
    if (url.includes('/uploads/')) {
        filename = url.split('/uploads/')[1];
    } else if (url.startsWith('default-')) {
        return null; // Skip defaults
    } else {
        filename = url;
    }
    
    if (!filename) return null;
    
    const localFilePath = path.join(__dirname, 'uploads', filename);
    return localFilePath;
}

async function migrateCourses() {
    console.log('Migrating Courses...');
    const courses = await prisma.course.findMany();
    for (const course of courses) {
        let updated = false;
        const data = {};

        // Thumbnail
        if (course.thumbnail && !course.thumbnail.startsWith('http') && !course.thumbnail.startsWith('default-')) {
            const localPath = getLocalPath(course.thumbnail);
            if (localPath) {
                console.log(`Processing course thumbnail: ${localPath}`);
                const url = await uploadToCloudinary(localPath, false);
                if (url) {
                    data.thumbnail = url;
                    updated = true;
                    try { fs.unlinkSync(localPath); } catch (e) {}
                }
            }
        }

        // Video
        if (course.videoUrl && !course.videoUrl.startsWith('http')) {
            const localPath = getLocalPath(course.videoUrl);
            if (localPath) {
                console.log(`Processing course video: ${localPath}`);
                const url = await uploadToCloudinary(localPath, true);
                if (url) {
                    data.videoUrl = url;
                    updated = true;
                    try { fs.unlinkSync(localPath); } catch (e) {}
                }
            }
        }

        if (updated) {
            await prisma.course.update({ where: { id: course.id }, data });
            console.log(`Updated course ${course.id}`);
        }
    }
}

async function migrateLessons() {
    console.log('Migrating Lessons...');
    const lessons = await prisma.lesson.findMany();
    for (const lesson of lessons) {
        if (lesson.videoUrl && !lesson.videoUrl.startsWith('http')) {
            const localPath = getLocalPath(lesson.videoUrl);
            if (localPath) {
                console.log(`Processing lesson video: ${localPath}`);
                const url = await uploadToCloudinary(localPath, true);
                if (url) {
                    await prisma.lesson.update({
                        where: { id: lesson.id },
                        data: { videoUrl: url }
                    });
                    console.log(`Updated lesson ${lesson.id}`);
                    try { fs.unlinkSync(localPath); } catch (e) {}
                }
            }
        }
    }
}

async function migrateUsers() {
    console.log('Migrating Users...');
    const users = await prisma.user.findMany();
    for (const user of users) {
        let updated = false;
        const data = {};

        if (user.avatar && !user.avatar.startsWith('http') && !user.avatar.startsWith('default-')) {
            const localPath = getLocalPath(user.avatar);
            if (localPath) {
                console.log(`Processing user avatar: ${localPath}`);
                const url = await uploadToCloudinary(localPath, false);
                if (url) {
                    data.avatar = url;
                    updated = true;
                    try { fs.unlinkSync(localPath); } catch (e) {}
                }
            }
        }

        if (user.coverPhoto && !user.coverPhoto.startsWith('http')) {
            const localPath = getLocalPath(user.coverPhoto);
            if (localPath) {
                console.log(`Processing user coverPhoto: ${localPath}`);
                const url = await uploadToCloudinary(localPath, false);
                if (url) {
                    data.coverPhoto = url;
                    updated = true;
                    try { fs.unlinkSync(localPath); } catch (e) {}
                }
            }
        }

        if (updated) {
            await prisma.user.update({ where: { id: user.id }, data });
            console.log(`Updated user ${user.id}`);
        }
    }
}

async function migrateLibrary() {
    console.log('Migrating Library files...');
    const items = await prisma.library.findMany();
    for (const item of items) {
        if (item.fileUrl && !item.fileUrl.startsWith('http')) {
            const localPath = getLocalPath(item.fileUrl);
            if (localPath) {
                console.log(`Processing library file: ${localPath}`);
                const url = await uploadToCloudinary(localPath, false);
                if (url) {
                    await prisma.library.update({
                        where: { id: item.id },
                        data: { fileUrl: url }
                    });
                    console.log(`Updated library item ${item.id}`);
                    try { fs.unlinkSync(localPath); } catch (e) {}
                }
            }
        }
    }
}

async function migrateMessageGroups() {
    console.log('Migrating MessageGroups...');
    const groups = await prisma.messageGroup.findMany();
    for (const group of groups) {
        if (group.avatar && !group.avatar.startsWith('http') && !group.avatar.startsWith('default-')) {
            const localPath = getLocalPath(group.avatar);
            if (localPath) {
                console.log(`Processing group avatar: ${localPath}`);
                const url = await uploadToCloudinary(localPath, false);
                if (url) {
                    await prisma.messageGroup.update({
                        where: { id: group.id },
                        data: { avatar: url }
                    });
                    console.log(`Updated group ${group.id}`);
                    try { fs.unlinkSync(localPath); } catch (e) {}
                }
            }
        }
    }
}

async function run() {
    try {
        console.log('Starting media migration...');
        await migrateCourses();
        await migrateLessons();
        await migrateUsers();
        await migrateLibrary();
        await migrateMessageGroups();
        console.log('Migration complete!');
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

run();
