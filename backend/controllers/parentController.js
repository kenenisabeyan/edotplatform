import { prisma } from '../lib/prisma.js';

export const getParentDashboardStats = async (req, res) => {
  try {
    const parentId = req.user.id;
    
    const parent = await prisma.user.findUnique({
      where: { id: parentId },
      include: {
        children: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            userCourseProgress: {
              include: {
                course: {
                  select: { title: true }
                }
              }
            }
          }
        }
      }
    });

    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    const children = parent.children || [];
    const totalLearners = children.length;
    
    let totalEnrolledCourses = 0;
    let totalProgress = 0;
    let progressCount = 0;
    let completedLessons = 0;
    let completedCourses = 0;

    children.forEach(child => {
      const enrolledCourses = child.userCourseProgress || [];
      if (enrolledCourses.length > 0) {
        totalEnrolledCourses += enrolledCourses.length;
        enrolledCourses.forEach(enroll => {
          totalProgress += enroll.progress || 0;
          progressCount++;
          
          let lessonsArr = [];
          if (enroll.completedLessons) {
             lessonsArr = Array.isArray(enroll.completedLessons) ? enroll.completedLessons : [enroll.completedLessons];
          }
          completedLessons += lessonsArr.length;
          
          if (enroll.passedFinalExam) {
            completedCourses++;
          }
        });
      }
    });

    const averageProgress = progressCount > 0 ? Math.round(totalProgress / progressCount) : 0;

    const performanceTimeline = [];

    const childrenIds = children.map(c => c.id);
    const rawActivities = await prisma.activity.findMany({
      where: { userId: { in: childrenIds } },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    const recentActivity = rawActivities.map(act => ({
      id: act.id,
      type: act.type || 'system',
      title: act.action,
      studentName: act.user?.name || 'Student',
      date: act.createdAt
    }));

    const primaryLearner = children.length > 0 ? {
      id: children[0].id,
      name: children[0].name,
      avatar: children[0].avatar
    } : null;

    res.json({
      success: true,
      data: {
        primaryLearner,
        totalLearners,
        totalEnrolledCourses,
        averageProgress,
        completedLessons,
        completedCourses,
        performanceTimeline,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error fetching parent dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard stats' });
  }
};

export const getParentLearners = async (req, res) => {
  try {
    const parentId = req.user.id;
    
    const parent = await prisma.user.findUnique({
      where: { id: parentId },
      include: {
        children: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            userCourseProgress: {
              include: {
                course: {
                  select: {
                    title: true,
                    description: true,
                    thumbnail: true,
                    mainCategory: true,
                    subCategory: true, // Prisma has mainCategory, subCategory instead of single category
                    level: true
                  }
                }
              }
            },
            activities: {
              where: {
                OR: [
                  { type: 'intervention' },
                  { type: 'alert' },
                  { type: 'insight' }
                ]
              },
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        }
      }
    });

    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }
    
    const mappedChildren = parent.children.map(child => {
      return {
        ...child,
        _id: child.id,
        enrolledCourses: child.userCourseProgress || [],
        activities: child.activities || []
      };
    });

    res.json({
      success: true,
      count: mappedChildren.length,
      data: mappedChildren
    });
  } catch (error) {
    console.error('Error fetching parent learners:', error);
    res.status(500).json({ success: false, message: 'Server error fetching learners data' });
  }
};

export const getParentStudentInsights = async (req, res) => {
  try {
    const parentId = req.user.id;
    const studentId = req.params.id;
    
    const parent = await prisma.user.findUnique({
      where: { id: parentId },
      include: { children: true }
    });
    
    if (!parent || !parent.children.some(child => child.id === studentId)) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to this student data' });
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
         userCourseProgress: {
            include: {
               course: { select: { title: true, mainCategory: true } }
            }
         }
      }
    });

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const enrolledCourses = student.userCourseProgress || [];

    const timeline = enrolledCourses.map((ec, idx) => ({
       id: idx,
       courseName: ec.course?.title || 'Unknown Course',
       progress: ec.progress || 0,
       status: ec.progress === 100 ? 'Completed' : (ec.progress > 0 ? 'In Progress' : 'Not Started'),
       date: new Date(Date.now() - (idx * 86400000)).toISOString()
    }));

    res.json({
        success: true,
        data: {
           studentName: student.name,
           avatar: student.avatar,
           timeline,
           overallProgress: enrolledCourses.length > 0 
                ? enrolledCourses.reduce((acc, curr) => acc + (curr.progress || 0), 0) / enrolledCourses.length 
                : 0
        }
    });

  } catch (error) {
     console.error('Error fetching student insights:', error);
     res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getParentStudentInvoice = async (req, res) => {
  try {
    const parentId = req.user.id;
    const studentId = req.params.id;
    
    const parent = await prisma.user.findUnique({
      where: { id: parentId },
      include: { children: true }
    });
    
    if (!parent || !parent.children.some(child => child.id === studentId)) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to this student data' });
    }

    res.json({
        success: true,
        data: {
           studentId: studentId,
           pendingFees: 450,
           currency: 'USD',
           dueDate: new Date(Date.now() + (7 * 86400000)).toISOString(),
           status: 'Pending',
           description: 'Fall Semester Registration & Labs'
        }
    });

  } catch (error) {
     console.error('Error fetching student invoice:', error);
     res.status(500).json({ success: false, message: 'Server error' });
  }
};
