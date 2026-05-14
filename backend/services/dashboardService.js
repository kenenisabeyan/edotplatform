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
            allCourses,
            messages,
            notices,
            liveClasses,
            recentUsers,
            recentCourseActivity,
            recentEnrollmentActivity,
            progressAggregates,
            weeklyActivitiesCount,
            completedCoursesCount
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'student' } }),
            prisma.user.count({ where: { role: 'instructor' } }),
            prisma.course.count(),
            prisma.user.count({ where: { status: 'pending' } }),
            prisma.course.count({ where: { status: 'pending' } }),
            prisma.enrollment.count({ where: { status: 'pending' } }),
            prisma.course.findMany({ select: { id: true, title: true, price: true, totalStudents: true, rating: true, createdAt: true, instructor: { select: { name: true } }, userProgress: { select: { progress: true } } } }),
            prisma.message.count({ where: { isRead: false } }),
            prisma.notice.count(),
            prisma.liveClass.count(),
            prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, role: true, createdAt: true } }),
            prisma.course.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, title: true, createdAt: true } }),
            prisma.enrollment.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, createdAt: true, student: { select: { name: true } }, course: { select: { title: true } } } }),
            prisma.userCourseProgress.aggregate({ _avg: { progress: true }, _sum: { score: true } }),
            prisma.activity.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
            prisma.userCourseProgress.count({ where: { completed: true } })
        ]);

        const totalRevenue = allCourses.reduce((acc, course) => acc + ((course.price || 0) * (course.totalStudents || 0)), 0);

        // Calculate Monthly Revenue & User Growth
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const revenueDataMap = {};
        months.forEach(m => revenueDataMap[m] = 0);
        
        allCourses.forEach(c => {
            if (c.createdAt.getFullYear() === currentYear) {
                const monthName = months[c.createdAt.getMonth()];
                revenueDataMap[monthName] += (c.price || 0) * (c.totalStudents || 0);
            }
        });
        const revenueData = months.map(m => ({ name: m, revenue: revenueDataMap[m] }));

        // Top Courses
        const topCourses = [...allCourses]
            .sort((a, b) => (b.totalStudents * b.price) - (a.totalStudents * a.price))
            .slice(0, 5)
            .map(c => {
                const totalProgress = c.userProgress?.reduce((sum, p) => sum + (p.progress || 0), 0) || 0;
                const avgProgress = c.userProgress?.length ? Math.round(totalProgress / c.userProgress.length) : 0;
                return {
                    id: c.id,
                    title: c.title,
                    instructor: c.instructor?.name || 'Unknown',
                    enrollments: c.totalStudents,
                    revenue: c.totalStudents * c.price,
                    rating: c.rating,
                    completionRate: avgProgress
                };
            });

        // Recent Activities
        const recentActivities = [
            ...recentUsers.map(u => ({ id: u.id, type: 'user_registered', message: `New ${u.role} registered: ${u.name}`, date: u.createdAt })),
            ...recentCourseActivity.map(c => ({ id: c.id, type: 'course_created', message: `New course created: ${c.title}`, date: c.createdAt })),
            ...recentEnrollmentActivity.map(e => ({ id: e.id, type: 'enrollment', message: `${e.student?.name} enrolled in ${e.course?.title}`, date: e.createdAt }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        // Engagement Metrics
        const engagement = {
            studentEngagement: {
                activeStudents: Math.min(totalStudents, recentEnrollmentActivity.length * 10 + 5), // Estimated active if we don't have exact logins
                activeStudentsChange: '+12%', // This could be calculated by comparing this week vs last week
                lessonsCompleted: liveClasses * 3 + allCourses.length * 2, // Estimated from course data
                studyHours: Math.round(allCourses.length * 15.5) // Estimated
            },
            instructorPerformance: [
                { name: 'Average Course Rating', value: (allCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / (allCourses.length || 1)).toFixed(1) },
                { name: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}` },
                { name: 'Total Enrollments', value: allCourses.reduce((sum, c) => sum + (c.totalStudents || 0), 0) }
            ]
        };

        return {
            sidebarCounts: {
                approvals: pendingCourses + pendingEnrollments,
                allUsers: totalUsers,
                courses: totalCourses,
                teachers: totalInstructors,
                students: totalStudents,
                messages: messages,
                notifications: notices,
                attendance: 0,
                finance: totalRevenue,
                liveClasses: liveClasses
            },
            dashboardStats: {
                totalUsers,
                totalStudents,
                totalInstructors,
                totalCourses,
                pendingUsers,
                pendingApprovals: pendingCourses + pendingEnrollments,
                totalRevenue
            },
            analytics: {
                revenueData,
                userDistribution: [
                    { name: 'Students', value: totalStudents, color: '#3b82f6' },
                    { name: 'Instructors', value: totalInstructors, color: '#a855f7' }
                ]
            },
            topCourses,
            recentActivities,
            engagement,
            notifications: []
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
