import express from 'express';
import { prisma } from '../lib/prisma.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'instructor'), async (req, res) => {
    try {
        const { name, courseId, instructorId, scheduleDays, scheduleTime, capacity, academicYear, semester, status, batch } = req.body;
        
        const courseExists = await prisma.course.findUnique({ where: { id: courseId } });
        if (!courseExists) return res.status(404).json({ success: false, message: 'Course not found' });

        const sectionCode = `${courseExists.slug.toUpperCase().substring(0, 5)}-SEC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Find or create LearnerGroup based on course category
        let group = null;
        if (courseExists.mainCategory) {
            group = await prisma.learnerGroup.findUnique({ where: { name: courseExists.mainCategory } });
            if (!group) {
                group = await prisma.learnerGroup.create({
                    data: { name: courseExists.mainCategory, description: `${courseExists.mainCategory} Category Group` }
                });
            }
        }

        const section = await prisma.section.create({
            data: {
                name,
                sectionCode,
                courseId,
                instructorId: instructorId || req.user.id,
                scheduleDays: scheduleDays || [],
                scheduleTime,
                capacity: capacity ? parseInt(capacity) : 30,
                academicYear: academicYear || '2026-2027',
                semester: semester || '1',
                status: status || 'active',
                batch: batch || null,
                groupId: group ? group.id : null
            }
        });

        res.status(201).json({ success: true, data: section });
    } catch (error) {
        console.error('Create Section Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/', protect, async (req, res) => {
    try {
        const query = {};
        if (req.query.courseId) query.courseId = req.query.courseId;

        if (req.user.role === 'instructor') {
            query.instructorId = req.user.id;
        } else if (req.user.role === 'student') {
            query.students = { some: { id: req.user.id } };
        }

        const sections = await prisma.section.findMany({
            where: query,
            include: {
                course: { select: { title: true, mainCategory: true } },
                instructor: { select: { name: true, email: true, avatar: true } },
                students: { select: { id: true, name: true, email: true, avatar: true } },
                group: true
            }
        });

        res.json({ success: true, count: sections.length, data: sections });
    } catch (error) {
        console.error('Get Sections Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/groups', protect, authorize('admin', 'instructor'), async (req, res) => {
    try {
        const groups = await prisma.learnerGroup.findMany({
            include: {
                students: { select: { id: true, name: true, email: true, avatar: true } },
                sections: true
            }
        });
        res.json({ success: true, data: groups });
    } catch (error) {
        console.error('Get Groups Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/:id', protect, async (req, res) => {
    try {
        const section = await prisma.section.findUnique({
            where: { id: req.params.id },
            include: {
                course: { select: { title: true } },
                instructor: { select: { name: true, email: true, avatar: true } },
                students: { select: { name: true, email: true, avatar: true } }
            }
        });

        if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

        res.json({ success: true, data: section });
    } catch (error) {
        console.error('Get Section Details Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/:id', protect, authorize('admin', 'instructor'), async (req, res) => {
    try {
        const userId = req.user.id;
        let section = await prisma.section.findUnique({ where: { id: req.params.id } });
        if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

        if (req.user.role !== 'admin' && section.instructorId !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this section' });
        }

        const { name, courseId, instructorId, scheduleDays, scheduleTime, capacity, academicYear, semester, status } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (courseId !== undefined) updateData.courseId = courseId;
        if (instructorId !== undefined) updateData.instructorId = instructorId;
        if (scheduleDays !== undefined) updateData.scheduleDays = scheduleDays;
        if (scheduleTime !== undefined) updateData.scheduleTime = scheduleTime;
        if (capacity !== undefined) updateData.capacity = parseInt(capacity);
        if (academicYear !== undefined) updateData.academicYear = academicYear;
        if (semester !== undefined) updateData.semester = semester;
        if (status !== undefined) updateData.status = status;

        section = await prisma.section.update({
            where: { id: req.params.id },
            data: updateData
        });
        
        res.json({ success: true, data: section });
    } catch (error) {
        console.error('Update Section Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/:id', protect, authorize('admin', 'instructor'), async (req, res) => {
    try {
        const userId = req.user.id;
        const section = await prisma.section.findUnique({ where: { id: req.params.id } });
        if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

        if (req.user.role !== 'admin' && section.instructorId !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this section' });
        }

        await prisma.section.delete({ where: { id: req.params.id } });
        res.json({ success: true, data: {} });
    } catch (error) {
        console.error('Delete Section Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/:id/add-student', protect, authorize('admin', 'instructor'), async (req, res) => {
    try {
        const { studentId } = req.body;
        const userId = req.user.id;
        
        if (!studentId) return res.status(400).json({ success: false, message: 'Please provide studentId' });

        const section = await prisma.section.findUnique({ 
            where: { id: req.params.id },
            include: { students: true }
        });
        if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

        if (req.user.role !== 'admin' && section.instructorId !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to modify this section' });
        }

        const student = await prisma.user.findUnique({ where: { id: studentId } });
        if (!student || student.role !== 'student') {
            return res.status(400).json({ success: false, message: 'Valid student user is required' });
        }

        if (section.students.some(s => s.id === studentId)) {
            return res.status(400).json({ success: false, message: 'Student is already in this section' });
        }

        if (section.students.length >= section.capacity) {
            return res.status(400).json({ success: false, message: 'Section has reached maximum capacity' });
        }

        const updatedSection = await prisma.section.update({
            where: { id: req.params.id },
            data: { students: { connect: { id: studentId } } },
            include: { students: true }
        });

        res.json({ success: true, message: 'Student added successfully', data: updatedSection });
    } catch (error) {
        console.error('Add Student Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/:id/auto-assign', protect, authorize('admin', 'instructor'), async (req, res) => {
    try {
        const sectionId = req.params.id;
        const section = await prisma.section.findUnique({ 
            where: { id: sectionId },
            include: { students: true }
        });
        if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
        
        // Find users enrolled in the course
        const enrolledUsers = await prisma.userCourseProgress.findMany({
            where: { courseId: section.courseId },
            include: { user: true }
        });
        
        // Filter those who match the batch (if section has batch)
        let eligibleStudents = enrolledUsers.map(e => e.user).filter(u => u.role === 'student');
        if (section.batch) {
            eligibleStudents = eligibleStudents.filter(u => u.batch === section.batch);
        }
        
        // Exclude already added students
        const currentStudentIds = new Set(section.students.map(s => s.id));
        eligibleStudents = eligibleStudents.filter(u => !currentStudentIds.has(u.id));
        
        if (eligibleStudents.length === 0) {
            return res.json({ success: true, message: 'No new eligible students found to auto-assign.', data: section });
        }
        
        // Check capacity
        const availableSlots = section.capacity - section.students.length;
        const studentsToAdd = eligibleStudents.slice(0, availableSlots);
        
        if (studentsToAdd.length === 0) {
            return res.status(400).json({ success: false, message: 'Section is already at full capacity.' });
        }
        
        const updatedSection = await prisma.section.update({
            where: { id: sectionId },
            data: {
                students: {
                    connect: studentsToAdd.map(s => ({ id: s.id }))
                }
            },
            include: { students: true }
        });

        res.json({ success: true, message: `Auto-assigned ${studentsToAdd.length} students.`, data: updatedSection });
    } catch (error) {
        console.error('Auto Assign Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/:id/assign-instructor', protect, authorize('admin'), async (req, res) => {
    try {
        const { instructorId } = req.body;
        if (!instructorId) return res.status(400).json({ success: false, message: 'Please provide instructorId' });

        const section = await prisma.section.findUnique({ where: { id: req.params.id } });
        if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

        const instructor = await prisma.user.findUnique({ where: { id: instructorId } });
        if (!instructor || instructor.role !== 'instructor') {
            return res.status(400).json({ success: false, message: 'Valid instructor user is required' });
        }

        const updatedSection = await prisma.section.update({
            where: { id: req.params.id },
            data: { instructorId }
        });

        res.json({ success: true, message: 'Instructor assigned successfully', data: updatedSection });
    } catch (error) {
        console.error('Assign Instructor Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
