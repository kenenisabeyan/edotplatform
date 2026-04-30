import express from 'express';
import { prisma } from '../lib/prisma.js';
import { protect, authorize } from '../middleware/auth.js';
import { hashPassword } from '../lib/modelHelpers.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                enrollments: { include: { course: { select: { title: true, status: true } } } },
                children: { select: { name: true, email: true, status: true } },
                assignedStudents: { select: { name: true, email: true, status: true, enrollments: true } },
                assignedInstructor: { select: { id: true, name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        const allCourses = await prisma.course.findMany({
            select: { id: true, title: true, instructorId: true, status: true, isPublished: true }
        });
        
        const enhancedUsers = users.map(user => {
            const result = { ...user };
            delete result.password;
            result.enrolledCourses = user.enrollments || [];
            if (user.role === 'instructor') {
                result.taughtCourses = allCourses.filter(c => c.instructorId === user.id);
            }
            return result;
        });

        res.status(200).json({ success: true, count: enhancedUsers.length, data: enhancedUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.post('/users', async (req, res) => {
    try {
        const { name, email, password, role, batch, section, department, specialization, phone } = req.body;
        
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'student',
                batch,
                section,
                department,
                specialization,
                phone
            }
        });

        res.status(201).json({
            success: true,
            data: {
                id: user.id,
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                batch: user.batch,
                section: user.section,
                department: user.department,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Admin Create User error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/users/:id', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: {
                children: { select: { id: true, name: true, email: true, status: true } },
                assignedStudents: { select: { id: true, name: true, email: true, status: true } }
            }
        });

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        delete user.password;

        const parents = await prisma.user.findMany({
            where: { children: { some: { id: user.id } } },
            select: { id: true, name: true, email: true, status: true }
        });

        res.status(200).json({ success: true, data: { ...user, parents } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.put('/users/:id/link-child', async (req, res) => {
    try {
        const parent = await prisma.user.findUnique({ where: { id: req.params.id } });
        const child = await prisma.user.findUnique({ where: { id: req.body.childId } });
        
        if (!parent || parent.role !== 'parent') return res.status(400).json({ success: false, message: 'Parent not found' });
        if (!child || child.role !== 'student') return res.status(400).json({ success: false, message: 'Child student not found' });

        const updatedParent = await prisma.user.update({
            where: { id: req.params.id },
            data: { children: { connect: { id: child.id } } },
            include: { children: true }
        });

        return res.status(200).json({ success: true, data: updatedParent });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.put('/users/:id/unlink-child', async (req, res) => {
    try {
        const parent = await prisma.user.findUnique({ where: { id: req.params.id } });
        const { childId } = req.body;
        
        if (!parent || parent.role !== 'parent') return res.status(400).json({ success: false, message: 'Parent not found' });

        const updatedParent = await prisma.user.update({
            where: { id: req.params.id },
            data: { children: { disconnect: { id: childId } } },
            include: { children: true }
        });

        res.status(200).json({ success: true, data: updatedParent });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.post('/enrollments/manual', async (req, res) => {
    try {
        const { studentId, courseId, status = 'active' } = req.body;
        const student = await prisma.user.findUnique({ where: { id: studentId } });
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        
        if (!student || student.role !== 'student') return res.status(400).json({ success: false, message: 'Student not found' });
        if (!course) return res.status(400).json({ success: false, message: 'Course not found' });

        let enrollment = await prisma.enrollment.findFirst({ where: { studentId, courseId } });
        if (!enrollment) {
            enrollment = await prisma.enrollment.create({
                data: { studentId, courseId, status }
            });
        } else {
            enrollment = await prisma.enrollment.update({
                where: { id: enrollment.id },
                data: { status }
            });
        }

        let userProgress = await prisma.userCourseProgress.findFirst({ where: { userId: studentId, courseId } });
        if (!userProgress) {
            await prisma.userCourseProgress.create({
                data: { userId: studentId, courseId, status, progress: 0, completedLessons: [] }
            });
        } else {
            await prisma.userCourseProgress.update({
                where: { id: userProgress.id },
                data: { status }
            });
        }

        if (status === 'active') {
            await prisma.course.update({
                where: { id: courseId },
                data: { totalStudents: { increment: 1 } }
            });
        }

        res.status(200).json({ success: true, data: enrollment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.delete('/enrollments/:id', async (req, res) => {
    try {
        const en = await prisma.enrollment.findUnique({ where: { id: req.params.id } });
        if (!en) return res.status(404).json({ success: false, message: 'Enrollment not found' });

        await prisma.enrollment.delete({ where: { id: req.params.id } });
        
        await prisma.userCourseProgress.deleteMany({
            where: { userId: en.studentId, courseId: en.courseId }
        });

        const course = await prisma.course.findUnique({ where: { id: en.courseId } });
        if (course && course.totalStudents > 0) {
            await prisma.course.update({ where: { id: en.courseId }, data: { totalStudents: { decrement: 1 } } });
        }

        res.status(200).json({ success: true, message: 'Enrollment removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.delete('/enrollments', async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        const en = await prisma.enrollment.findFirst({ where: { studentId, courseId } });
        if (!en) return res.status(404).json({ success: false, message: 'Enrollment not found' });

        await prisma.enrollment.delete({ where: { id: en.id } });
        await prisma.userCourseProgress.deleteMany({
            where: { userId: studentId, courseId }
        });

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (course && course.totalStudents > 0) {
            await prisma.course.update({ where: { id: courseId }, data: { totalStudents: { decrement: 1 } } });
        }

        res.status(200).json({ success: true, message: 'Enrollment removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/instructors', async (req, res) => {
    try {
        const instructors = await prisma.user.findMany({
            where: { role: 'instructor' },
            include: { assignedStudents: { select: { id: true, name: true, email: true, status: true } } },
            orderBy: { createdAt: 'desc' }
        });
        
        instructors.forEach(i => delete i.password);
        res.status(200).json({ success: true, count: instructors.length, data: instructors });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.put('/instructor/:id/approve', async (req, res) => {
    try {
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { status: 'approved' }
        });
        delete user.password;
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.put('/instructor/:id/reject', async (req, res) => {
    try {
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { status: 'rejected' }
        });
        delete user.password;
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/students', async (req, res) => {
    try {
        const students = await prisma.user.findMany({
            where: { role: 'student' },
            include: { assignedInstructor: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        
        students.forEach(s => delete s.password);
        res.status(200).json({ success: true, count: students.length, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.put('/student/:id/approve', async (req, res) => {
    try {
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { status: 'approved' }
        });
        delete user.password;
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.put('/student/:id/reject', async (req, res) => {
    try {
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { status: 'rejected' }
        });
        delete user.password;
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.put('/student/:id/assign', async (req, res) => {
    try {
        const { instructorId } = req.body;
        const student = await prisma.user.findUnique({ where: { id: req.params.id } });
        const instructor = await prisma.user.findUnique({ where: { id: instructorId } });

        if (!student || !instructor || student.role !== 'student' || instructor.role !== 'instructor') {
            return res.status(400).json({ success: false, message: 'Invalid assignment targets' });
        }

        const updatedStudent = await prisma.user.update({
            where: { id: req.params.id },
            data: { assignedInstructorId: instructorId }
        });

        res.status(200).json({ success: true, message: 'Student assigned safely', data: updatedStudent });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.put('/users/:id/role', async (req, res) => {
    try {
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { role: req.body.role }
        });
        delete user.password;
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const { name, email, role, password, status } = req.body;
        const updateData = {};
        
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (status && ['pending', 'approved', 'rejected', 'blocked'].includes(status)) updateData.status = status;
        if (password && password.length >= 6) updateData.password = await hashPassword(password);

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: updateData
        });
        
        delete user.password;
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.post('/users/:id/reset-password', async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword) return res.status(400).json({ success: false, message: 'New password required' });

        await prisma.user.update({
            where: { id: req.params.id },
            data: { password: await hashPassword(newPassword) }
        });

        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.put('/users/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected', 'blocked'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { status }
        });
        delete user.password;
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.put('/users/:id/reset-progress', async (req, res) => {
    try {
        await prisma.userCourseProgress.updateMany({
            where: { userId: req.params.id },
            data: {
                progress: 0,
                completedLessons: [],
                watchedVideos: [],
                passedQuizzes: [],
                passedFinalExam: false
            }
        });

        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: { enrollments: true }
        });
        
        res.status(200).json({ success: true, data: user, message: 'Student progress reset successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true, message: 'User removed completely' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/courses', async (req, res) => {
    try {
        const courses = await prisma.course.findMany({ include: { instructor: { select: { name: true, email: true } } } });
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/courses/pending', async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            where: { status: 'pending' },
            include: { instructor: { select: { name: true, email: true } } }
        });
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.put('/courses/:id/status', async (req, res) => {
    try {
        const course = await prisma.course.update({
            where: { id: req.params.id },
            data: {
                status: req.body.status,
                isPublished: req.body.status === 'approved'
            }
        });
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/enrollments/pending', async (req, res) => {
    try {
        const pendingEnrollments = await prisma.enrollment.findMany({
            where: { status: 'pending' },
            include: {
                student: { select: { id: true, name: true, email: true, status: true } },
                course: { select: { id: true, title: true, instructorId: true } }
            }
        });

        const payload = pendingEnrollments.map((en) => ({
            id: en.id,
            id: en.id,
            studentId: en.student?.id,
            studentName: en.student?.name,
            studentEmail: en.student?.email,
            courseId: en.course?.id,
            courseTitle: en.course?.title,
            requestedAt: en.requestedAt,
            status: en.status
        }));

        res.status(200).json({ success: true, count: payload.length, data: payload });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/enrollments/active', async (req, res) => {
    try {
        const activeEnrollments = await prisma.enrollment.findMany({
            where: { status: 'active' },
            include: {
                student: { select: { id: true, name: true, email: true, status: true, batch: true } },
                course: { select: { id: true, title: true, instructorId: true } }
            },
            orderBy: { requestedAt: 'desc' },
            take: 50 // Limit to recent 50 for performance, or add pagination
        });

        const payload = activeEnrollments.map((en) => ({
            id: en.id,
            studentId: en.student?.id,
            studentName: en.student?.name,
            studentEmail: en.student?.email,
            studentBatch: en.student?.batch,
            courseId: en.course?.id,
            courseTitle: en.course?.title,
            requestedAt: en.requestedAt,
            status: en.status
        }));

        res.status(200).json({ success: true, count: payload.length, data: payload });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.put('/enrollments/:id/status', async (req, res) => {
    try {
        const { status, reason } = req.body;
        if (!['active', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status option' });
        }

        const enrollment = await prisma.enrollment.update({
            where: { id: req.params.id },
            data: { status, reason: reason || '' },
            include: { course: true }
        });

        const userProgress = await prisma.userCourseProgress.findFirst({
            where: { userId: enrollment.studentId, courseId: enrollment.courseId }
        });

        if (userProgress) {
            await prisma.userCourseProgress.update({
                where: { id: userProgress.id },
                data: { status }
            });
        } else {
            await prisma.userCourseProgress.create({
                data: {
                    userId: enrollment.studentId,
                    courseId: enrollment.courseId,
                    status,
                    progress: 0,
                    completedLessons: []
                }
            });
        }

        if (status === 'active') {
            await prisma.course.update({
                where: { id: enrollment.courseId },
                data: { totalStudents: { increment: 1 } }
            });
        }

        res.status(200).json({ success: true, data: enrollment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/analytics/detailed', async (req, res) => {
    try {
        const users = await prisma.user.findMany({ select: { role: true, createdAt: true } });
        const courses = await prisma.course.findMany({ select: { title: true, price: true, totalStudents: true, createdAt: true, isPublished: true, instructorId: true } });

        const revenueData = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const d = new Date();
        for (let i = 5; i >= 0; i--) {
            let m = new Date(d.getFullYear(), d.getMonth() - i, 1);
            let monthRev = 0;
            courses.forEach(c => {
                if (c.isPublished && c.price && c.totalStudents) {
                    if (new Date(c.createdAt) <= new Date(m.getFullYear(), m.getMonth() + 1, 0)) {
                         monthRev += (c.price * c.totalStudents); 
                    }
                }
            });
            revenueData.push({ name: monthNames[m.getMonth()], revenue: monthRev });
        }

        const engagementData = [];
        for (let i = 3; i >= 0; i--) {
            let start = new Date();
            start.setDate(start.getDate() - (i*7));
            let sCount = users.filter(u => u.role === 'student' && new Date(u.createdAt) <= start).length;
            let tCount = users.filter(u => u.role === 'instructor' && new Date(u.createdAt) <= start).length;
            engagementData.push({ name: `Week ${4-i}`, students: sCount, teachers: tCount });
        }

        let total = courses.length;
        let published = courses.filter(c => c.isPublished).length;
        const courseCompletionData = [
            { name: 'Published', value: published, color: '#10b981' },
            { name: 'Draft/Pending', value: (total - published), color: '#f59e0b' }
        ];

        res.status(200).json({
            success: true,
            data: {
                revenueData,
                engagementData,
                courseCompletionData,
                totalRevenue: revenueData.reduce((acc, curr) => acc + curr.revenue, 0),
                totalActiveLearners: users.filter(u => u.role === 'student').length,
                totalCourseCompletions: 0 
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/dashboard', async (req, res) => {
    try {
        const totalUsers = await prisma.user.count({ where: { status: 'approved' } });
        const totalStudents = await prisma.user.count({ where: { role: 'student', status: 'approved' } });
        const totalInstructors = await prisma.user.count({ where: { role: 'instructor', status: 'approved' } });
        
        const courses = await prisma.course.findMany();
        const totalCourses = courses.length;
        const pendingCourses = courses.filter(c => c.status === 'pending').length;
        const pendingUsers = await prisma.user.count({ where: { status: 'pending' } });
        
        let totalRevenue = 0;
        courses.forEach(course => {
            if (course.isPublished && course.price && course.totalStudents) {
                totalRevenue += (course.price * course.totalStudents);
            }
        });

        const topCourses = courses.filter(c => c.isPublished).sort((a,b) => b.totalStudents - a.totalStudents).slice(0, 3);
        const courseIds = topCourses.map(c => c.id);
        
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        
        const rawLogs = await prisma.progressLog.findMany({
            where: {
                courseId: { in: courseIds },
                updatedAt: { gte: fiveDaysAgo }
            },
            include: { course: { select: { title: true } } }
        });

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const studentPerformanceData = [4, 3, 2, 1, 0].map(diff => {
            const d = new Date();
            d.setDate(d.getDate() - diff);
            return {
                name: days[d.getDay()],
                dateStr: d.toISOString().split('T')[0],
                value1: 0,
                value2: 0,
                value3: 0
            };
        });

        rawLogs.forEach(log => {
             const logDate = new Date(log.updatedAt).toISOString().split('T')[0];
             const targetDay = studentPerformanceData.find(d => d.dateStr === logDate);
             if (targetDay) {
                  const cid = log.courseId;
                  if (topCourses[0] && cid === topCourses[0].id) targetDay.value1 += 1;
                  else if (topCourses[1] && cid === topCourses[1].id) targetDay.value2 += 1;
                  else if (topCourses[2] && cid === topCourses[2].id) targetDay.value3 += 1;
             }
        });

        const cleanStudentPerformance = studentPerformanceData.map(({name, value1, value2, value3}) => ({name, value1, value2, value3}));

        const recentUsers = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
        const recentActivity = [];
        recentUsers.forEach(u => recentActivity.push({ 
             id: u.id, 
             title: u.status === 'pending' ? `New ${u.role} registered (Pending)` : `New ${u.role} joined`, 
             itemTitle: u.name, 
             type: u.status === 'pending' ? 'user_pending' : 'user_joined', 
             studentName: u.name, 
             date: u.createdAt 
        }));
        const recentCoursesObj = await prisma.course.findMany({ where: { isPublished: true }, orderBy: { createdAt: 'desc' }, take: 3 });
        recentCoursesObj.forEach(c => recentActivity.push({ id: c.id, title: 'Course published', itemTitle: c.title, type: 'course_completed', studentName: 'System', date: c.createdAt }));
        recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalStudents,
                totalInstructors,
                totalCourses,
                pendingCourses,
                pendingUsers,
                totalRevenue,
                studentPerformanceData: cleanStudentPerformance,
                courseNames: topCourses.map(c => c.title),
                recentActivity: recentActivity.slice(0, 5)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

export default router;
