import { prisma } from '../lib/prisma.js';

class DashboardService {
    async getAdminStats() {
        const [
            totalUsers,
            totalStudents,
            totalInstructors,
            totalCourses,
            pendingUsers,
            pendingCourses,
            pendingEnrollments,
            courses,
            messages,
            notices,
            liveClasses
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'student' } }),
            prisma.user.count({ where: { role: 'instructor' } }),
            prisma.course.count(),
            prisma.user.count({ where: { status: 'pending' } }),
            prisma.course.count({ where: { status: 'pending' } }),
            prisma.enrollment.count({ where: { status: 'pending' } }),
            prisma.course.findMany({ select: { price: true, totalStudents: true } }),
            prisma.message.count(),
            prisma.notice.count(),
            prisma.liveClass.count()
        ]);

        const totalRevenue = courses.reduce((acc, course) => acc + ((course.price || 0) * (course.totalStudents || 0)), 0);

        return {
            totalUsers,
            totalStudents,
            totalInstructors,
            totalCourses,
            pendingUsers,
            pendingCourses,
            pendingEnrollments,
            totalRevenue,
            unreadMessages: messages, // Or calculate unread if logic exists
            notifications: notices, // Simple count
            liveClasses,
            pendingApprovals: pendingCourses + pendingEnrollments // Aggregated pending metric for courses & enrollments
        };
    }

    async getInstructorStats(instructorId) {
        const [
            totalCourses,
            courses
        ] = await Promise.all([
            prisma.course.count({ where: { instructorId } }),
            prisma.course.findMany({ where: { instructorId }, select: { totalStudents: true } })
        ]);

        const totalStudents = courses.reduce((acc, course) => acc + (course.totalStudents || 0), 0);

        return {
            totalCourses,
            totalStudents,
        };
    }

    async getStudentStats(studentId) {
        const [
            enrollments,
            certificates
        ] = await Promise.all([
            prisma.enrollment.count({ where: { studentId } }),
            prisma.certificate.count({ where: { userId: studentId } })
        ]);

        return {
            enrolledCourses: enrollments,
            certificatesEarned: certificates,
        };
    }
}

export default new DashboardService();
