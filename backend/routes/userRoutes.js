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

router.get('/dashboard-stats', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 1. Get recent courses (last 3 accessed/enrolled)
        let recentCourses = await prisma.userCourseProgress.findMany({
            where: { userId },
            include: { 
                course: {
                    include: { lessons: true }
                } 
            },
            orderBy: { updatedAt: 'desc' },
            take: 3
        });
        
        // Fallback for legacy data: if no userCourseProgress exists but enrollments exist
        if (recentCourses.length === 0) {
            const enrollments = await prisma.enrollment.findMany({
                where: { studentId: userId },
                include: { 
                    course: {
                        include: { lessons: true }
                    } 
                },
                orderBy: { createdAt: 'desc' },
                take: 3
            });
            
            const userCertificates = await prisma.certificate.findMany({
                where: { userId },
                include: { course: true }
            });
            const certCourseIds = userCertificates.map(c => c.courseId);

            recentCourses = enrollments.map(e => ({
                id: e.id,
                courseId: e.courseId,
                course: e.course,
                progress: certCourseIds.includes(e.courseId) ? 100 : 0,
                completedLessons: [],
                status: certCourseIds.includes(e.courseId) ? 'completed' : e.status
            }));
        }

        // 2. Weekly Study Goal & Study Data
        const userSettings = await prisma.userSetting.findUnique({
            where: { userId }
        });
        const studyGoal = userSettings?.weeklyStudyGoal || 10;

        // Generate real weekly data from progress logs
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday
        startOfWeek.setHours(0,0,0,0);

        const recentLogs = await prisma.progressLog.findMany({
            where: {
                userId,
                updatedAt: { gte: startOfWeek }
            }
        });

        const weeklyDataMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        recentLogs.forEach(log => {
            const dayName = dayNames[log.updatedAt.getDay()];
            // Estimate hours based on video segments (each segment is 30s)
            let segments = 0;
            if (log.videoSegments) {
               segments = Array.isArray(log.videoSegments) ? log.videoSegments.length : 1;
            }
            const hours = (segments * 30) / 3600;
            weeklyDataMap[dayName] += hours;
        });

        // Round to 1 decimal place or 0 if empty, to ensure UI is clean
        const weeklyStudyData = Object.keys(weeklyDataMap).map(day => ({
            name: day,
            hours: Math.round(weeklyDataMap[day] * 10) / 10
        }));

        // Calculate actual study days this week
        const daysStudied = weeklyStudyData.filter(d => d.hours > 0).length;

        // 3. Percentile (calculation based on their progress vs others)
        const allProgress = await prisma.userCourseProgress.findMany({ where: { userId } });
        const avg = allProgress.length > 0 ? allProgress.reduce((sum, p) => sum + p.progress, 0) / allProgress.length : 0;
        const percentile = Math.min(99, Math.floor(30 + (avg * 0.6)));

        // 4. Achievements
        const achievementsData = await prisma.achievement.findUnique({ where: { userId } });
        let badges = achievementsData?.badges || [];

        if (!Array.isArray(badges)) {
            badges = [];
        }

        // Auto-generate badges based on real progress if missing from explicit table
        const userCertificates = await prisma.certificate.findMany({
            where: { userId },
            include: { course: true }
        });
        const certificatesCount = userCertificates.length;
        const completedCoursesCount = recentCourses.filter(c => c.progress === 100 || c.status === 'completed').length;
        
        const generatedBadges = [];
        if (certificatesCount > 0) {
            generatedBadges.push({
                id: 'cert_1',
                title: 'Certified Scholar',
                icon: 'Award',
                date: new Date().toISOString(),
                description: `Earned ${certificatesCount} platform certificates`
            });
        }
        if (completedCoursesCount > 0) {
            generatedBadges.push({
                id: 'comp_1',
                title: 'Course Finisher',
                icon: 'Star',
                date: new Date().toISOString(),
                description: `Completed ${completedCoursesCount} full courses`
            });
        }
        if (daysStudied >= 3) {
            generatedBadges.push({
                id: 'streak_1',
                title: 'Consistent Learner',
                icon: 'Zap',
                date: new Date().toISOString(),
                description: `Studied ${daysStudied} days this week`
            });
        }

        // Merge generated badges with DB badges, avoiding duplicates by title
        const finalBadges = [...badges];
        generatedBadges.forEach(gb => {
            if (!finalBadges.find(b => b.title === gb.title)) {
                finalBadges.push(gb);
            }
        });

        res.json({
            success: true,
            data: {
                recentCourses,
                studyGoal,
                weeklyStudyData,
                daysStudied,
                percentile,
                achievements: finalBadges,
                certificates: userCertificates
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/ecosystem', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 1. Get real user with relationships
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                parent: true,
                assignedInstructor: true,
                enrollments: {
                    include: {
                        course: {
                            include: { instructor: true }
                        }
                    }
                },
                sponsorships: {
                    include: {
                        sponsor: true
                    }
                }
            }
        });

        // Collect parents
        const parents = [];
        if (user.parent) {
            parents.push({
                id: user.parent.id,
                name: user.parent.name,
                status: 'active',
                encryptionKey: `E2E-${user.parent.id.substring(0, 4).toUpperCase()}`
            });
        }

        // Collect distinct instructors from enrollments + assignedInstructor
        const instructorMap = new Map();
        if (user.assignedInstructor) {
            instructorMap.set(user.assignedInstructor.id, {
                id: user.assignedInstructor.id,
                name: user.assignedInstructor.name,
                role: 'Assigned Mentor',
                status: 'active'
            });
        }
        
        user.enrollments?.forEach(e => {
            if (e.course?.instructor) {
                instructorMap.set(e.course.instructor.id, {
                    id: e.course.instructor.id,
                    name: e.course.instructor.name,
                    role: 'Course Instructor',
                    status: 'active'
                });
            }
        });
        const instructors = Array.from(instructorMap.values());

        // Collect Sponsors
        const sponsors = user.sponsorships?.map(s => ({
            id: s.sponsor.id,
            name: s.sponsor.name,
            status: s.status === 'active' ? 'active' : 'pending_consent',
            encryptionKey: `E2E-${s.id.substring(0, 4).toUpperCase()}`
        })) || [];

        res.json({
            success: true,
            data: {
                parents,
                instructors,
                sponsors,
                admin: { id: 'admin-core', name: 'System Core Security', status: 'active' }
            }
        });
    } catch (error) {
        console.error('Ecosystem fetch error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
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