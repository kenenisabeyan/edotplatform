import { prisma } from '../lib/prisma.js';
import { normalizeAttendanceDate } from '../lib/modelHelpers.js'; // If using the helper I made

export const getCourseAttendance = async (req, res) => {
  try {
    const { sectionId } = req.params;
    
    const section = await prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    
    const userId = req.user.id;
    if (req.user.role !== 'admin' && section.instructorId !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this sections attendance' });
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: { section: section.name, courseId: section.courseId },
      orderBy: { date: 'desc' }
    });

    
    const allUserIds = new Set();
    attendanceRecords.forEach(att => {
        const recs = att.records ? (Array.isArray(att.records) ? att.records : [att.records]) : [];
        recs.forEach(r => { if (r.user) allUserIds.add(r.user); });
    });
    
    const users = await prisma.user.findMany({
        where: { id: { in: Array.from(allUserIds) } },
        select: { id: true, name: true, email: true, avatar: true, role: true }
    });
    
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u; });

    const enrichedAttendance = attendanceRecords.map(att => {
        const attObj = { ...att };
        const recs = attObj.records ? (Array.isArray(attObj.records) ? attObj.records : [attObj.records]) : [];
        
        attObj.records = recs.map(r => ({
            ...r,
            user: userMap[r.user] || r.user 
        }));
        return attObj;
    });

    res.status(200).json({ success: true, count: enrichedAttendance.length, data: enrichedAttendance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAttendanceByQuery = async (req, res) => {
  try {
    const { courseId, section, date } = req.query;
    
    if (!courseId || !section || !date) {
      return res.status(400).json({ success: false, message: 'courseId, section, and date are required parameters' });
    }

    const queryDate = new Date(date);
    const startOfDay = new Date(Date.UTC(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate()));

    const attendance = await prisma.attendance.findUnique({
      where: {
          courseId_section_date: {
             courseId,
             section,
             date: startOfDay
          }
      }
    });

    if (!attendance) {
      return res.status(200).json({ success: true, data: null });
    }

    const recs = attendance.records ? (Array.isArray(attendance.records) ? attendance.records : [attendance.records]) : [];
    const userIds = recs.map(r => r.user).filter(Boolean);
    
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true, avatar: true, role: true }
    });
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u; });

    attendance.records = recs.map(r => ({ ...r, user: userMap[r.user] || r.user }));

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const submitAttendance = async (req, res) => {
  try {
    const { courseId, section, date, records } = req.body;
    
    if (!courseId || !section || !date || !records) {
      return res.status(400).json({ success: false, message: 'Please provide courseId, section, date, and records' });
    }

    const courseObj = await prisma.course.findUnique({ where: { id: courseId } });
    if (!courseObj) return res.status(404).json({ success: false, message: 'Course not found' });

    const formattedRecords = records.map(r => ({
      user: r.userId,
      role: r.role,
      status: r.status.toLowerCase()
    }));

    const queryDate = new Date(date);
    const startOfDay = new Date(Date.UTC(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate()));

    const attendance = await prisma.attendance.upsert({
      where: {
          courseId_section_date: {
             courseId,
             section,
             date: startOfDay
          }
      },
      update: {
          records: formattedRecords
      },
      create: {
          courseId,
          section,
          date: startOfDay,
          records: formattedRecords
      }
    });

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getEnrolledUsers = async (req, res) => {
  try {
    const { courseId, section } = req.query;

    if (!courseId || !section) {
      return res.status(400).json({ success: false, message: 'courseId and section are required parameters' });
    }

    const sectionDocs = await prisma.section.findMany({
        where: { courseId, name: section },
        include: {
            instructor: { select: { id: true, name: true, email: true, avatar: true, role: true } },
            students: { select: { id: true, name: true, email: true, avatar: true, role: true } }
        }
    });
    
    const sectionDoc = sectionDocs.length > 0 ? sectionDocs[0] : null;

    if (!sectionDoc) {
      return res.status(404).json({ success: false, message: 'Section not found for this course' });
    }

    const students = [];
    const instructors = [];

    if (sectionDoc.instructor) {
      instructors.push({
        userId: sectionDoc.instructor.id,
        name: sectionDoc.instructor.name,
        role: 'instructor'
      });
    }

    if (sectionDoc.students && sectionDoc.students.length > 0) {
      sectionDoc.students.forEach(student => {
        students.push({
          userId: student.id,
          name: student.name,
          role: 'student'
        });
      });
    }

    res.status(200).json({
      students,
      instructors
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDashboardAggregate = async (req, res) => {
  try {
    const userId = req.user.id;
    let whereCondition = {};
    
    if (req.user.role === 'instructor') {
       whereCondition = { course: { instructorId: userId } };
    } // admin sees all

    const attendances = await prisma.attendance.findMany({
        where: whereCondition,
        select: { records: true }
    });

    let present = 0;
    let absent = 0;

    attendances.forEach(att => {
        const recs = att.records ? (Array.isArray(att.records) ? att.records : [att.records]) : [];
        recs.forEach(r => {
            if (!r || !r.status) return;
            const s = r.status.toLowerCase();
            if (s === 'present') present++;
            else if (s === 'absent') absent++;
            else if (s === 'late') present++; // Late counts as present for base metric usually
        });
    });

    const total = present + absent;
    
    if (total === 0) {
      return res.status(200).json({ success: true, data: [
        { name: 'Present', value: 80, color: '#a78bfa' },
        { name: 'Absent', value: 20, color: '#fcd34d' }
      ]});
    }

    res.status(200).json({
      success: true,
      data: [
         { name: 'Present', value: present, color: '#a78bfa' },
         { name: 'Absent', value: absent, color: '#fcd34d' }
      ],
      raw: { present, absent, total }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const submitFinalReport = async (req, res) => {
  try {
    const { courseId, term, studentRecords } = req.body;
    const userId = req.user.id;
    
    const courseObj = await prisma.course.findUnique({ where: { id: courseId } });
    if (!courseObj) return res.status(404).json({ success: false, message: 'Course not found' });

    if (req.user.role !== 'admin' && courseObj.instructorId !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to submit report for this course' });
    }

    const instructorIdToUse = req.user.role === 'admin' ? courseObj.instructorId : userId;
    const reportTerm = term || 'Fall Term';
    
    const recordsPayload = {
      create: studentRecords.map(r => ({
        studentId: r.student || r.studentId, // Support frontend payload variations
        attendancePercentage: r.attendancePercentage || 0,
        finalGrade: r.finalGrade || 'Pending',
        remarks: r.remarks || ''
      }))
    };

    const existingReport = await prisma.courseReport.findFirst({
        where: {
            courseId,
            instructorId: instructorIdToUse,
            term: reportTerm
        }
    });

    let report;
    if (existingReport) {
        await prisma.courseReportRecord.deleteMany({ where: { courseReportId: existingReport.id } });
        report = await prisma.courseReport.update({
            where: { id: existingReport.id },
            data: {
                status: 'submitted',
                records: recordsPayload
            },
            include: { records: true }
        });
    } else {
        report = await prisma.courseReport.create({
            data: {
                courseId,
                instructorId: instructorIdToUse,
                term: reportTerm,
                status: 'submitted',
                records: recordsPayload
            },
            include: { records: true }
        });
    }

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getFinalReports = async (req, res) => {
  try {
    const userId = req.user.id;
    let whereCondition = {};
    if (req.user.role === 'instructor') {
       whereCondition = { instructorId: userId };
    }
    
    const reports = await prisma.courseReport.findMany({
      where: whereCondition,
      include: {
        course: { select: { title: true, mainCategory: true } },
        instructor: { select: { name: true, email: true } },
        records: {
            include: { student: { select: { name: true, email: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const mappedReports = reports.map(rep => ({
        ...rep,
        studentRecords: rep.records.map(rec => ({
            ...rec,
            student: rec.student
        }))
    }));

    res.status(200).json({ success: true, count: mappedReports.length, data: mappedReports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
