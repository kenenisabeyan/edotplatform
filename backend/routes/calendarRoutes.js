import express from 'express';
import { prisma } from '../lib/prisma.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        let queryCondition = { 
            OR: [
                { targetAudiences: { hasSome: ['all', req.user.role] } },
                { createdById: userId } // Creators always see their own events
            ] 
        };

        if (req.user.role === 'admin') {
            queryCondition = {}; 
        } else if (req.user.role === 'student' && req.user.assignedInstructor) {
            queryCondition.OR.push({
                AND: [
                    { targetAudiences: { has: 'my_students' } },
                    { createdById: req.user.assignedInstructor }
                ]
            });
        }

        const events = await prisma.event.findMany({
            where: queryCondition,
            orderBy: { date: 'desc' }
        });
        
        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.post('/', protect, authorize('admin', 'instructor'), async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description, date, type, color, targetAudiences, audience } = req.body;
        
        let audiences = targetAudiences || [];
        
        if (audience && (!targetAudiences || targetAudiences.length === 0)) {
            audiences = [audience];
        }

        if (req.user.role === 'instructor') {
            const restrictedTargets = ['admin', 'all'];
            if (audiences.some(tgt => restrictedTargets.includes(tgt))) {
                return res.status(403).json({ success: false, message: 'Limit exceeded: Instructors can only target students and parents.' });
            }
        }

        const event = await prisma.event.create({
            data: {
                title,
                description,
                date: new Date(date),
                type: type || 'announcement',
                color: color || 'bg-indigo-500',
                targetAudiences: audiences,
                createdById: userId
            }
        });
        
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.delete('/:id', protect, authorize('admin', 'instructor'), async (req, res) => {
    try {
        const userId = req.user.id;
        const event = await prisma.event.findUnique({ where: { id: req.params.id } });
        
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        
        if (req.user.role !== 'admin' && event.createdById !== userId) {
             return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
        }
        
        await prisma.event.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

export default router;
