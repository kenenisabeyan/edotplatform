import express from 'express';
import { protect } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

router.get('/public/recent', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 3,
            select: { id: true, name: true, avatar: true }
        });
        
        const totalCount = await prisma.user.count();

        res.json({
            success: true,
            users,
            totalCount
        });
    } catch (error) {
        console.error('Get recent public users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

router.get('/profile', protect, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                enrollments: {
                    include: {
                        course: {
                            include: { instructor: { select: { name: true } } }
                        }
                    }
                }
            }
        });
        
        if (user) {
            delete user.password;
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

router.put('/profile', protect, async (req, res) => {
    try {
        const { 
            name, bio, avatar, coverPhoto, phone,
            gender, dateOfBirth, address, emergencyContact, department, specialization, occupation 
        } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (coverPhoto !== undefined) updateData.coverPhoto = coverPhoto;
        if (phone !== undefined) updateData.phone = phone;
        if (gender !== undefined) updateData.gender = gender;
        if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
        if (address !== undefined) updateData.address = address;
        if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;
        if (department !== undefined) updateData.department = department;
        if (specialization !== undefined) updateData.specialization = specialization;
        if (occupation !== undefined) updateData.occupation = occupation;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData
        });

        res.json({
            success: true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                bio: updatedUser.bio,
                avatar: updatedUser.avatar,
                coverPhoto: updatedUser.coverPhoto,
                phone: updatedUser.phone,
                gender: updatedUser.gender,
                dateOfBirth: updatedUser.dateOfBirth,
                address: updatedUser.address,
                emergencyContact: updatedUser.emergencyContact,
                department: updatedUser.department,
                specialization: updatedUser.specialization,
                occupation: updatedUser.occupation
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

router.get('/mycourses', protect, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                enrollments: {
                    include: {
                        course: {
                            include: {
                                instructor: { select: { name: true } },
                                lessons: true
                            }
                        }
                    }
                }
            }
        });

        res.json({
            success: true,
            enrolledCourses: user?.enrollments || []
        });
    } catch (error) {
        console.error('Get my courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

router.get('/dashboard-metrics', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        const unreadMessages = await prisma.message.count({
            where: { receiverId: userId, isRead: false }
        });
        
        let pendingCourses = 0;
        let pendingApprovals = 0;
        let pendingEnrollments = 0;
        let newCertificates = 0;
        let pendingUsers = 0;

        if (role === 'admin') {
            pendingApprovals = await prisma.course.count({ where: { status: 'pending' } });
            pendingEnrollments = await prisma.enrollment.count({ where: { status: 'pending' } });
            pendingUsers = await prisma.user.count({ where: { status: 'pending' } });
        } else if (role === 'instructor') {
            pendingCourses = await prisma.course.count({ where: { instructorId: userId, status: 'pending' } });
        } else if (role === 'student' || role === 'parent') {
            newCertificates = await prisma.certificate.count({ where: { userId, isSeen: false } });
        }

        res.json({
            success: true,
            metrics: {
                unreadMessages,
                pendingApprovals,
                pendingEnrollments,
                pendingCourses,
                newCertificates,
                pendingUsers
            }
        });
    } catch (error) {
        console.error('Metrics error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/mark-certificates-seen', protect, async (req, res) => {
    try {
        await prisma.certificate.updateMany({
            where: { userId: req.user.id, isSeen: false },
            data: { isSeen: true }
        });
        res.json({ success: true, message: 'Certificates marked as seen' });
    } catch (error) {
        console.error('Mark certs error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/connect', protect, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const targetUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const currentUser = await prisma.user.findUnique({ 
            where: { id: req.user.id },
            include: { children: true }
        });
        
        let parent, student;

        if (currentUser.role === 'parent' && targetUser.role === 'student') {
            parent = currentUser;
            student = targetUser;
        } else if (currentUser.role === 'student' && targetUser.role === 'parent') {
            parent = targetUser;
            student = currentUser;
        } else {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid connection request. Only parents and students can connect to each other.'
            });
        }

        if (currentUser.role === 'parent') {
            if (parent.children.some(child => child.id === student.id)) {
                return res.status(400).json({ success: false, message: 'Already connected to this user.' });
            }
            await prisma.user.update({
                where: { id: parent.id },
                data: { children: { connect: { id: student.id } } }
            });
        } else {
            const targetParent = await prisma.user.findUnique({
                where: { id: targetUser.id },
                include: { children: true }
            });
            if (targetParent.children.some(child => child.id === student.id)) {
                return res.status(400).json({ success: false, message: 'Already connected to this user.' });
            }
            await prisma.user.update({
                where: { id: targetParent.id },
                data: { children: { connect: { id: student.id } } }
            });
        }

        res.json({ success: true, message: 'Successfully connected!' });
    } catch (error) {
        console.error('Connect route error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;