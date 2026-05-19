import express from 'express';
import { prisma } from '../lib/prisma.js';
import { protect, authorize } from '../middleware/auth.js';
import { hashPassword } from '../lib/modelHelpers.js';

const router = express.Router();

const normalizeAttendanceRecords = (records) => {
    if (!records) return [];
    if (Array.isArray(records)) return records;
    return [records];
};

const getLastNMonths = (count = 6) => {
    const labels = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push({
            key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            label: date.toLocaleString('default', { month: 'short', year: 'numeric' })
        });
    }
    return labels;
};

const getLastNWeeks = (count = 4) => {
    const weeks = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (now.getDay() || 7) - i * 7 + 1);
        const weekLabel = `Wk ${Math.ceil((startOfWeek.getDate() + (startOfWeek.getDay() || 7) - 1) / 7)}`;
        weeks.push({
            startDate: new Date(startOfWeek),
            label: weekLabel
        });
    }
    return weeks;
};

const calculateAttendanceSummary = (attendanceRows) => {
    let present = 0;
    let absent = 0;
    let late = 0;
    const monthlyTrend = {};
    const weeklyTrend = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const studentTotals = {};

    attendanceRows.forEach((attendance) => {
        const records = normalizeAttendanceRecords(attendance.records);
        const monthKey = `${attendance.date.getFullYear()}-${String(attendance.date.getMonth() + 1).padStart(2, '0')}`;
        records.forEach((record) => {
            if (!record || !record.status) return;
            const status = String(record.status).toLowerCase();
            const role = String(record.role || '').toLowerCase();
            const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][attendance.date.getDay()];

            monthlyTrend[monthKey] = monthlyTrend[monthKey] || { present: 0, absent: 0, late: 0 };
            if (status === 'present') {
                present += 1;
                monthlyTrend[monthKey].present += 1;
            } else if (status === 'absent') {
                absent += 1;
                monthlyTrend[monthKey].absent += 1;
            } else if (status === 'late') {
                late += 1;
                monthlyTrend[monthKey].late += 1;
            }

            if (dayName in weeklyTrend && (status === 'present' || status === 'late')) {
                weeklyTrend[dayName] += 1;
            }

            if (role === 'student' && record.user) {
                studentTotals[record.user] = studentTotals[record.user] || { present: 0, total: 0 };
                studentTotals[record.user].total += 1;
                if (status === 'present' || status === 'late') {
                    studentTotals[record.user].present += 1;
                }
            }
        });
    });

    const total = present + absent + late;
    const attendanceRate = total ? Math.round(((present + late) / total) * 100) : 100;
    const monthlyData = Object.entries(monthlyTrend)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, values]) => ({ month, ...values }));
    const weeklyData = Object.entries(weeklyTrend).map(([day, value]) => ({ name: day, value }));

    const lowAttendance = Object.entries(studentTotals)
        .filter(([, stats]) => stats.total >= 3 && Math.round((stats.present / stats.total) * 100) < 75)
        .map(([studentId, stats]) => ({ studentId, attendanceRate: Math.round((stats.present / stats.total) * 100) }));

    return {
        present,
        absent,
        late,
        total,
        attendanceRate,
        monthlyData,
        weeklyData,
        lowAttendance
    };
};

const buildMonthlyRevenue = (courses, sponsorshipAmount = 0) => {
    const months = getLastNMonths(6);
    const monthly = months.map((item) => ({ name: item.label, courseRevenue: 0, sponsorshipRevenue: 0, revenue: 0 }));

    courses.forEach((course) => {
        if (!course.createdAt) return;
        const createdMonth = `${course.createdAt.getFullYear()}-${String(course.createdAt.getMonth() + 1).padStart(2, '0')}`;
        const target = months.find((m) => m.key === createdMonth);
        if (target) {
            const numStudents = course.actualStudents ?? course.totalStudents ?? 0;
            const revenue = (course.price || 0) * numStudents;
            const month = monthly.find((m) => m.name === target.label);
            if (month) {
                month.courseRevenue += revenue;
                month.revenue = month.courseRevenue + month.sponsorshipRevenue;
            }
        }
    });

    monthly.forEach((month) => {
        month.revenue = month.courseRevenue + month.sponsorshipRevenue;
    });

    const totalCourseRevenue = monthly.reduce((sum, item) => sum + item.courseRevenue, 0);
    return {
        monthlyRevenue: monthly,
        sponsorshipRevenue: sponsorshipAmount,
        totalCourseRevenue,
        totalRevenue: totalCourseRevenue + sponsorshipAmount
    };
};

router.use(protect);
router.use(authorize('admin'));

router.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                enrollments: { include: { course: { select: { title: true, status: true } } } },
                children: { select: { name: true, email: true, status: true } },
                parent: { select: { id: true, name: true, email: true } },
                assignedStudents: { select: { name: true, email: true, status: true, enrollments: true } },
                assignedInstructor: { select: { id: true, name: true, email: true } },
                sponsorships: { include: { sponsor: { select: { id: true, name: true, email: true } } } },
                certificates: true,
                learnerGroups: true
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
                assignedStudents: { select: { id: true, name: true, email: true, status: true } },
                sponsorships: { include: { sponsor: { select: { id: true, name: true, email: true } } } },
                learnerGroups: true
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

router.put('/student/:id/assign-parent', async (req, res) => {
    try {
        const { parentId } = req.body;
        const student = await prisma.user.findUnique({ where: { id: req.params.id } });
        
        if (!student || student.role !== 'student') {
            return res.status(400).json({ success: false, message: 'Invalid student' });
        }

        const updatedStudent = await prisma.user.update({
            where: { id: req.params.id },
            data: { parentId: parentId || null }
        });

        res.status(200).json({ success: true, message: 'Parent assigned safely', data: updatedStudent });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.put('/student/:id/assign-sponsor', async (req, res) => {
    try {
        const { sponsorId } = req.body;
        const studentId = req.params.id;

        const student = await prisma.user.findUnique({ where: { id: studentId } });
        
        if (!student || student.role !== 'student') {
            return res.status(400).json({ success: false, message: 'Invalid student' });
        }

        if (sponsorId) {
            const sponsor = await prisma.user.findUnique({ where: { id: sponsorId } });
            if (!sponsor || sponsor.role !== 'admin') { // Sponsor can be anything really, but assuming user exists
                // We don't strictly enforce sponsor role as it could be any user, but let's just make sure they exist
            }
            
            // Check if sponsorship already exists between these two
            const existing = await prisma.sponsorship.findFirst({
                where: { targetStudentId: studentId, sponsorId: sponsorId }
            });

            if (!existing) {
                await prisma.sponsorship.create({
                    data: {
                        targetStudentId: studentId,
                        sponsorId: sponsorId,
                        sponsorName: sponsor?.name || 'Sponsor',
                        status: 'active',
                        amount: 0
                    }
                });
            }
        } else {
            // Unlink all sponsors if sponsorId is empty (or specifically this one if we had multiple UI)
            // For simplicity of a single dropdown, we'll just clear the main sponsorship
            await prisma.sponsorship.deleteMany({
                where: { targetStudentId: studentId }
            });
        }

        res.status(200).json({ success: true, message: 'Sponsor assigned safely' });
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
            include: { 
                assignedStudents: { select: { id: true, name: true, email: true, status: true, avatar: true, sectionsJoined: { select: { name: true } } } },
                learnerGroups: true,
                coursesTaught: { select: { id: true, title: true, mainCategory: true, status: true } },
                sectionsTaught: { select: { id: true, name: true, sectionCode: true, status: true } }
            },
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
            include: { 
                assignedInstructor: { select: { id: true, name: true, email: true } },
                certificates: true,
                learnerGroups: true,
                enrollments: { select: { courseId: true } }
            },
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

// Assign Course to Instructor
router.put('/instructor/:id/assign-course', async (req, res) => {
    try {
        const { courseId } = req.body;
        const updatedCourse = await prisma.course.update({
            where: { id: courseId },
            data: { instructorId: req.params.id }
        });
        res.status(200).json({ success: true, message: 'Course assigned safely', data: updatedCourse });
    } catch (error) {
        console.error("Assign Course Error:", error);
        res.status(500).json({ success: false, message: 'Failed to assign course' });
    }
});

// Assign Section to Instructor
router.put('/instructor/:id/assign-section', async (req, res) => {
    try {
        const { sectionId } = req.body;
        const updatedSection = await prisma.section.update({
            where: { id: sectionId },
            data: { instructorId: req.params.id }
        });
        res.status(200).json({ success: true, message: 'Section assigned safely', data: updatedSection });
    } catch (error) {
        console.error("Assign Section Error:", error);
        res.status(500).json({ success: false, message: 'Failed to assign section' });
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
        const adminId = req.user.id;
        
        if (!['active', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status option' });
        }

        const enrollment = await prisma.enrollment.findUnique({ 
            where: { id: req.params.id },
            include: { course: true }
        });
        
        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found' });
        }

        const updateData = {
            status,
            reason: reason || '',
            ...(status === 'active' && { 
                approvedAt: new Date(),
                approvedBy: adminId 
            }),
            ...(status === 'rejected' && { 
                rejectionReason: reason || '' 
            })
        };

        const updatedEnrollment = await prisma.enrollment.update({
            where: { id: req.params.id },
            data: updateData,
            include: { course: true, student: { select: { name: true, email: true } } }
        });

        const userProgress = await prisma.userCourseProgress.findFirst({
            where: { userId: updatedEnrollment.studentId, courseId: updatedEnrollment.courseId }
        });

        if (userProgress) {
            await prisma.userCourseProgress.update({
                where: { id: userProgress.id },
                data: { status }
            });
        } else {
            await prisma.userCourseProgress.create({
                data: {
                    userId: updatedEnrollment.studentId,
                    courseId: updatedEnrollment.courseId,
                    status,
                    progress: 0,
                    completedLessons: []
                }
            });
        }

        if (status === 'active') {
            await prisma.course.update({
                where: { id: updatedEnrollment.courseId },
                data: { totalStudents: { increment: 1 } }
            });
        }

        res.status(200).json({ 
            success: true, 
            message: status === 'active' ? 'Enrollment approved successfully' : 'Enrollment rejected',
            data: updatedEnrollment 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// NEW ENDPOINT: Approve a specific enrollment request
router.post('/enrollments/:id/approve', async (req, res) => {
    try {
        const adminId = req.user.id;
        const enrollment = await prisma.enrollment.findUnique({ 
            where: { id: req.params.id },
            include: { course: true, student: { select: { id: true, name: true, email: true } } }
        });
        
        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found' });
        }

        if (enrollment.status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot approve enrollment with status: ${enrollment.status}` 
            });
        }

        const approvedEnrollment = await prisma.enrollment.update({
            where: { id: req.params.id },
            data: {
                status: 'active',
                approvedAt: new Date(),
                approvedBy: adminId,
                reason: ''
            },
            include: { course: true, student: { select: { id: true, name: true, email: true } } }
        });

        // Update user progress
        let userProgress = await prisma.userCourseProgress.findFirst({
            where: { userId: enrollment.studentId, courseId: enrollment.courseId }
        });

        if (userProgress) {
            await prisma.userCourseProgress.update({
                where: { id: userProgress.id },
                data: { status: 'active' }
            });
        } else {
            await prisma.userCourseProgress.create({
                data: {
                    userId: enrollment.studentId,
                    courseId: enrollment.courseId,
                    status: 'active',
                    progress: 0,
                    completedLessons: []
                }
            });
        }

        // Increment course total students
        await prisma.course.update({
            where: { id: enrollment.courseId },
            data: { totalStudents: { increment: 1 } }
        });

        res.status(200).json({ 
            success: true, 
            message: `Enrollment approved for ${enrollment.student.name} in course ${enrollment.course.title}`,
            data: approvedEnrollment 
        });
    } catch (error) {
        console.error('Approve enrollment error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// NEW ENDPOINT: Reject a specific enrollment request
router.post('/enrollments/:id/reject', async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        const adminId = req.user.id;
        
        const enrollment = await prisma.enrollment.findUnique({ 
            where: { id: req.params.id },
            include: { course: true, student: { select: { id: true, name: true, email: true } } }
        });
        
        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found' });
        }

        if (enrollment.status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot reject enrollment with status: ${enrollment.status}` 
            });
        }

        const rejectedEnrollment = await prisma.enrollment.update({
            where: { id: req.params.id },
            data: {
                status: 'rejected',
                rejectionReason: rejectionReason || 'Rejected by admin',
                reason: rejectionReason || 'Rejected by admin'
            },
            include: { course: true, student: { select: { id: true, name: true, email: true } } }
        });

        // Update user progress status
        let userProgress = await prisma.userCourseProgress.findFirst({
            where: { userId: enrollment.studentId, courseId: enrollment.courseId }
        });

        if (userProgress) {
            await prisma.userCourseProgress.update({
                where: { id: userProgress.id },
                data: { status: 'rejected' }
            });
        }

        res.status(200).json({ 
            success: true, 
            message: `Enrollment rejected for ${enrollment.student.name} in course ${enrollment.course.title}`,
            data: rejectedEnrollment 
        });
    } catch (error) {
        console.error('Reject enrollment error:', error);
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
        // Cache dashboard stats for 30 seconds to reduce database load
        res.set('Cache-Control', 'public, max-age=30');
        
        // Fetch only essential counts in parallel - NO heavy calculations
        const [totalCourses, totalStudents, totalInstructors, pendingCourses, pendingUsers, pendingEnrollments, totalRevenue] = await Promise.all([
            prisma.course.count(),
            prisma.user.count({ where: { role: 'student', status: 'approved' } }),
            prisma.user.count({ where: { role: 'instructor', status: 'approved' } }),
            prisma.course.count({ where: { status: 'pending' } }),
            prisma.user.count({ where: { status: 'pending' } }),
            prisma.enrollment.count({ where: { status: 'pending' } }),
            prisma.sponsorship.aggregate({ _sum: { amount: true }, where: { termsAccepted: true, status: 'accepted' } })
        ]);

        const sponsorshipRevenue = totalRevenue._sum?.amount || 0;

        res.status(200).json({
            success: true,
            data: {
                totalUsers: totalStudents + totalInstructors,
                totalStudents,
                totalInstructors,
                totalCourses,
                pendingCourses,
                pendingUsers,
                pendingEnrollments,
                sponsorshipRevenue,
                finance: {
                    sponsorshipIncome: sponsorshipRevenue,
                    pendingPayments: pendingEnrollments
                }
            }
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/analytics/detailed', async (req, res) => {
    try {
        const dashboardRes = await prisma.course.findMany({
            select: { id: true, title: true, price: true, totalStudents: true, isPublished: true, createdAt: true, instructorId: true }
        });

        const courses = await prisma.course.findMany({ select: { price: true, totalStudents: true, createdAt: true, isPublished: true } });
        const sponsorshipSummary = await prisma.sponsorship.aggregate({ _sum: { amount: true }, where: { termsAccepted: true, status: 'accepted' } });
        const revenueData = buildMonthlyRevenue(courses, sponsorshipSummary._sum?.amount || 0).monthlyRevenue;

        const progressRecords = await prisma.userCourseProgress.findMany({ select: { courseId: true, progress: true, completed: true, status: true } });
        const topCourses = dashboardRes
            .filter((course) => course.isPublished)
            .sort((a, b) => (b.totalStudents || 0) - (a.totalStudents || 0))
            .slice(0, 5)
            .map((course, index) => {
                const courseProgress = progressRecords.filter((record) => record.courseId === course.id);
                const completions = courseProgress.filter((record) => record.completed || record.progress >= 100 || record.status === 'completed').length;
                const completionRate = courseProgress.length ? Math.round((completions / courseProgress.length) * 100) : 0;
                return {
                    id: course.id,
                    title: course.title,
                    enrollments: course.totalStudents || 0,
                    completionRate,
                    ranking: index + 1
                };
            });

        const instructorMetrics = await prisma.user.findMany({
            where: { role: 'instructor', status: 'approved' },
            select: { id: true, name: true, avatar: true, coursesTaught: { select: { id: true, title: true, totalStudents: true } } }
        });

        const engagementSummary = {
            dailyActiveUsers: await prisma.activity.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
            lessonsCompleted: progressRecords.filter((record) => record.completed || record.progress >= 100 || record.status === 'completed').length,
            studyHours: Math.round(progressRecords.length * 0.35),
            courseActivity: progressRecords.length
        };

        res.status(200).json({ success: true, data: { topCourses, instructorPerformance: instructorMetrics, engagementSummary, revenueData } });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/analytics', async (req, res) => {
    try {
        const dashboardRes = await prisma.course.findMany({
            select: { id: true, title: true, price: true, totalStudents: true, isPublished: true, createdAt: true, instructorId: true }
        });

        const progressRecords = await prisma.userCourseProgress.findMany({ select: { courseId: true, progress: true, completed: true, status: true } });
        const courses = await prisma.course.findMany({ select: { id: true, price: true, totalStudents: true, createdAt: true, isPublished: true } });
        courses.forEach(c => {
             c.actualStudents = progressRecords.filter(r => r.courseId === c.id).length;
        });

        const sponsorshipSummary = await prisma.sponsorship.aggregate({ _sum: { amount: true }, where: { termsAccepted: true, status: 'accepted' } });
        const revenueResult = buildMonthlyRevenue(courses, sponsorshipSummary._sum?.amount || 0);
        const revenueData = revenueResult.monthlyRevenue;
        const totalRevenue = revenueResult.totalRevenue;
        const topCourses = dashboardRes
            .filter((course) => course.isPublished)
            .map(course => {
                const courseProgress = progressRecords.filter((record) => record.courseId === course.id);
                const completions = courseProgress.filter((record) => record.completed || record.progress >= 100 || record.status === 'completed').length;
                const completionRate = courseProgress.length ? Math.round((completions / courseProgress.length) * 100) : 0;
                const avgProgress = courseProgress.length ? Math.round(courseProgress.reduce((sum, r) => sum + (r.progress || 0), 0) / courseProgress.length) : 0;
                return {
                    id: course.id,
                    title: course.title,
                    realEnrollments: courseProgress.length,
                    enrollments: courseProgress.length,
                    completionRate,
                    avgProgress
                };
            })
            .sort((a, b) => b.avgProgress - a.avgProgress || b.realEnrollments - a.realEnrollments)
            .slice(0, 5)
            .map((course, index) => ({
                id: course.id,
                title: course.title,
                enrollments: course.enrollments,
                completionRate: course.completionRate,
                ranking: index + 1
            }));

        const rawInstructorMetrics = await prisma.user.findMany({
            where: { role: 'instructor', status: 'approved' },
            select: { id: true, name: true, avatar: true, coursesTaught: { select: { id: true, title: true, totalStudents: true } } }
        });

        const instructorMetrics = rawInstructorMetrics.map(inst => {
            const courses = inst.coursesTaught || [];
            const courseIds = courses.map(c => c.id);
            const courseProgress = progressRecords.filter(r => courseIds.includes(r.courseId));
            const completions = courseProgress.filter((record) => record.completed || record.progress >= 100 || record.status === 'completed').length;
            const completionRate = courseProgress.length ? Math.round((completions / courseProgress.length) * 100) : 0;
            
            return {
                id: inst.id,
                name: inst.name,
                avatar: inst.avatar,
                studentCount: courseProgress.length,
                coursesTaught: courses.length,
                completionRate,
                performanceScore: completionRate,
                attendanceRate: 100
            };
        });

        const engagementSummary = {
            dailyActiveUsers: await prisma.activity.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
            lessonsCompleted: progressRecords.filter((record) => record.completed || record.progress >= 100 || record.status === 'completed').length,
            studyHours: Math.round(progressRecords.length * 0.35),
            courseActivity: progressRecords.length
        };

        res.status(200).json({ success: true, data: { topCourses, instructorPerformance: instructorMetrics, engagementSummary, revenueData, totalRevenue } });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/attendance', async (req, res) => {
    try {
        const attendanceRows = await prisma.attendance.findMany({ select: { date: true, records: true, courseId: true } });
        const attendanceMetrics = calculateAttendanceSummary(attendanceRows);
        res.status(200).json({ success: true, data: attendanceMetrics });
    } catch (error) {
        console.error('Attendance summary error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/revenue', async (req, res) => {
    try {
        const courses = await prisma.course.findMany({ select: { id: true, price: true, totalStudents: true, createdAt: true, isPublished: true } });
        const progressRecords = await prisma.userCourseProgress.findMany({ select: { courseId: true } });
        courses.forEach(c => {
             c.actualStudents = progressRecords.filter(r => r.courseId === c.id).length;
        });
        const sponsorshipSummary = await prisma.sponsorship.aggregate({ _sum: { amount: true }, where: { termsAccepted: true, status: 'accepted' } });
        const monthlyRevenue = buildMonthlyRevenue(courses, sponsorshipSummary._sum?.amount || 0);
        res.status(200).json({ success: true, data: monthlyRevenue });
    } catch (error) {
        console.error('Revenue summary error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/top-courses', async (req, res) => {
    try {
        const courses = await prisma.course.findMany({ where: { isPublished: true }, select: { id: true, title: true, thumbnail: true, totalStudents: true } });
        const progressRecords = await prisma.userCourseProgress.findMany({ select: { courseId: true, progress: true, completed: true, status: true } });
        const topCourses = courses
            .map((course) => {
                const progress = progressRecords.filter((record) => record.courseId === course.id);
                const completions = progress.filter((record) => record.completed || record.progress >= 100 || record.status === 'completed').length;
                return {
                    ...course,
                    realEnrollments: progress.length,
                    completionRate: progress.length ? Math.round((completions / progress.length) * 100) : 0,
                    avgProgress: progress.length ? Math.round(progress.reduce((sum, r) => sum + (r.progress || 0), 0) / progress.length) : 0,
                    engagementScore: Math.round(((completions || 0) / Math.max(progress.length, 1)) * 100)
                };
            })
            .sort((a, b) => b.avgProgress - a.avgProgress || b.realEnrollments - a.realEnrollments)
            .slice(0, 5)
            .map((course, index) => ({
                ...course,
                rank: index + 1
            }));

        res.status(200).json({ success: true, data: topCourses });
    } catch (error) {
        console.error('Top courses error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/instructors', async (req, res) => {
    try {
        const instructors = await prisma.user.findMany({
            where: { role: 'instructor', status: 'approved' },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                coursesTaught: { select: { id: true, title: true, totalStudents: true } }
            }
        });

        const progressRecords = await prisma.userCourseProgress.findMany({ select: { courseId: true, progress: true, completed: true, status: true } });
        const attendanceRows = await prisma.attendance.findMany({ select: { courseId: true, records: true } });

        const instructorPerformance = instructors.map((instructor) => {
            const courses = instructor.coursesTaught || [];
            const courseIds = courses.map((course) => course.id);
            const courseProgress = progressRecords.filter((record) => courseIds.includes(record.courseId));
            const completions = courseProgress.filter((record) => record.completed || record.progress >= 100 || record.status === 'completed').length;
            const averageCompletion = courseProgress.length ? Math.round((completions / courseProgress.length) * 100) : 0;
            const studentCount = courseProgress.length;
            let present = 0;
            let total = 0;

            attendanceRows.forEach((attendance) => {
                if (!courseIds.includes(attendance.courseId)) return;
                const records = normalizeAttendanceRecords(attendance.records);
                records.forEach((record) => {
                    if (!record) return;
                    total += 1;
                    if (['present', 'late'].includes(String(record.status || '').toLowerCase())) {
                        present += 1;
                    }
                });
            });

            const attendanceRate = total ? Math.round((present / total) * 100) : 100;
            const score = Math.round((averageCompletion * 0.6) + (attendanceRate * 0.4));

            return {
                id: instructor.id,
                name: instructor.name,
                email: instructor.email,
                avatar: instructor.avatar,
                coursesTaught: courses.length,
                studentCount,
                completionRate: averageCompletion,
                attendanceRate,
                performanceScore: score
            };
        });

        res.status(200).json({ success: true, data: instructorPerformance });
    } catch (error) {
        console.error('Instructor analytics error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/engagement', async (req, res) => {
    try {
        const progressRecords = await prisma.userCourseProgress.findMany({ select: { userId: true, progress: true, completed: true, status: true, completedLessons: true } });
        const recentProgress = await prisma.progressLog.findMany({ select: { userId: true, videoSegments: true, createdAt: true } });

        const activeStudents = new Set(progressRecords.map((record) => record.userId)).size;
        const lessonsCompleted = progressRecords.reduce((sum, record) => {
            if (Array.isArray(record.completedLessons)) {
                return sum + record.completedLessons.length;
            }
            return sum;
        }, 0);
        const studyHours = Math.round(recentProgress.reduce((sum, record) => {
            const segments = Array.isArray(record.videoSegments) ? record.videoSegments.length : (typeof record.videoSegments === 'number' ? record.videoSegments : 0);
            return sum + segments * 0.25;
        }, 0) * 10) / 10;
        const dailyActiveUsers = new Set(recentProgress.filter((record) => record.createdAt >= new Date(Date.now() - 24 * 60 * 60 * 1000)).map((record) => record.userId)).size;

        res.status(200).json({
            success: true,
            data: {
                activeStudents,
                lessonsCompleted,
                studyHours,
                courseActivity: progressRecords.length,
                dailyActiveUsers
            }
        });
    } catch (error) {
        console.error('Engagement error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/events', async (req, res) => {
    try {
        const events = await prisma.event.findMany({ orderBy: { date: 'asc' }, take: 20 });
        res.status(200).json({ success: true, data: events });
    } catch (error) {
        console.error('Events fetch error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/notifications', async (req, res) => {
    try {
        const notifications = await prisma.notice.findMany({ orderBy: { date: 'desc' }, take: 20 });
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        console.error('Notifications fetch error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.get('/activities', async (req, res) => {
    try {
        const activities = await prisma.activity.findMany({
            include: { user: { select: { id: true, name: true, role: true } } },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        const formattedActivities = activities.map(act => ({
            id: act.id,
            type: act.type || 'system',
            title: act.action || 'Activity',
            studentName: act.user?.name || 'System',
            itemTitle: act.details || '',
            date: act.createdAt
        }));
        res.status(200).json({ success: true, data: formattedActivities });
    } catch (error) {
        console.error('Activities fetch error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

export default router;
