import express from 'express';
import { prisma } from '../lib/prisma.js';
import { protect, authorize, guardActiveEnrollment, checkNotBlocked } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, checkNotBlocked, async (req, res) => {
    try {
        const resources = await prisma.library.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, count: resources.length, data: resources });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error retrieving library' });
    }
});

router.post('/', protect, authorize('admin', 'instructor'), async (req, res) => {
    try {
        const { title, author, category, fileUrl, courseId } = req.body;
        if (!title || !author || !fileUrl) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }
        
        const payload = {
            title,
            author,
            category: category || 'General',
            fileUrl,
            uploadedById: req.user.id
        };
        
        if (courseId && courseId !== 'general') {
            payload.courseId = courseId;
        }
        
        const resource = await prisma.library.create({
            data: payload
        });
        res.status(201).json({ success: true, data: resource });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error saving resource' });
    }
});

router.get('/course/:courseId', protect, checkNotBlocked, authorize('student'), guardActiveEnrollment, async (req, res) => {
    try {
        const resources = await prisma.library.findMany({
            where: { courseId: req.params.courseId },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, count: resources.length, data: resources });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error retrieving course resources' });
    }
});

router.delete('/:id', protect, authorize('admin', 'instructor'), async (req, res) => {
    try {
        const resource = await prisma.library.findUnique({ where: { id: req.params.id } });
        if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
        
        const userId = req.user.id;
        if(resource.uploadedById !== userId && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this resource' });
        }

        await prisma.library.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error deleting resource' });
    }
});

export default router;
