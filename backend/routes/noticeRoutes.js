import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        const notices = await prisma.notice.findMany({
            where: {
                OR: [
                    { audience: 'all' },
                    { audience: req.user.role }
                ]
            },
            orderBy: { date: 'desc' }
        });
        
        res.status(200).json({ success: true, count: notices.length, data: notices });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.post('/', protect, authorize('admin', 'instructor'), async (req, res) => {
    try {
        const { title, content, audience } = req.body;
        const authorId = req.user.id;

        const notice = await prisma.notice.create({
            data: {
                title,
                content,
                audience: audience || 'all',
                authorId
            }
        });
        
        res.status(201).json({ success: true, data: notice });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

export default router;
