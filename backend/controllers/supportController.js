import { prisma } from '../lib/prisma.js';

export const supportStudent = async (req, res) => {
  try {
    const { studentId, amount, isAnonymous, termsAccepted } = req.body;

    if (!termsAccepted) {
      return res.status(400).json({ success: false, message: "Privacy and Security Terms must be accepted to initialize a connection." });
    }

    const existing = await prisma.sponsorship.findFirst({
      where: {
        targetStudentId: studentId,
        status: { in: ["active", "pending_consent"] }
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Student already has an active or pending sponsor pipeline. Choose another student."
      });
    }

    const secureChannel = await prisma.messageGroup.create({
      data: {
        name: `Proxy-Channel-${Date.now().toString().slice(-6)}`,
        description: "Encrypted direct communication channel. All interactions are moderated by EDOT Administration.",
        isChannel: false,
        adminId: req.user.id, // Sponsor initializes it
        members: {
          connect: [{ id: req.user.id }, { id: studentId }]
        }
      }
    });

    const support = await prisma.sponsorship.create({
      data: {
        targetStudentId: studentId,
        sponsorId: req.user.id,
        sponsorName: isAnonymous ? "Anonymous Benefactor" : req.user.name,
        amount: Number(amount),
        isAnonymous: Boolean(isAnonymous),
        termsAccepted: Boolean(termsAccepted),
        messageChannelId: secureChannel.id,
        status: "pending_consent" // Mandates student approval to activate
      }
    });

    res.status(201).json({ success: true, data: support, message: "Sponsorship offer sent. Awaiting student consent." });
  } catch (err) {
    console.error('Error creating support:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const acceptSponsorship = async (req, res) => {
  try {
    const { sponsorshipId } = req.params;
    const userId = req.user.id;

    const sponsorship = await prisma.sponsorship.findFirst({
      where: { id: sponsorshipId, targetStudentId: userId, status: 'pending_consent' }
    });

    if (!sponsorship) {
      return res.status(404).json({ success: false, message: "Sponsorship offer not found or already processed." });
    }

    const updated = await prisma.sponsorship.update({
      where: { id: sponsorshipId },
      data: { status: 'active' }
    });

    if (updated.messageChannelId) {
       await prisma.message.create({
          data: {
            content: "SYSTEM ALERT: The student has formally consented to the sponsorship terms. The secure channel is now globally active.",
            senderId: userId,
            groupId: updated.messageChannelId
          }
       });
    }

    res.status(200).json({ success: true, message: "Sponsorship Activated. Secure proxy established." });
  } catch (err) {
    console.error('Accept Sponsorship Error:', err);
    res.status(500).json({ success: false, error: "Server Protocol Initialization Failed" });
  }
};

export const rejectSponsorship = async (req, res) => {
  try {
    const { sponsorshipId } = req.params;
    const userId = req.user.id;

    const sponsorship = await prisma.sponsorship.findFirst({
      where: { id: sponsorshipId, targetStudentId: userId, status: 'pending_consent' }
    });

    if (!sponsorship) {
      return res.status(404).json({ success: false, message: "Sponsorship offer not found." });
    }

    const updated = await prisma.sponsorship.update({
      where: { id: sponsorshipId },
      data: { status: 'rejected' }
    });
    
    if (updated.messageChannelId) {
       await prisma.messageGroup.delete({ where: { id: updated.messageChannelId } }).catch(() => null);
    }

    res.status(200).json({ success: true, message: "Sponsorship Declined. Contact constraints preserved." });
  } catch (err) {
    console.error('Reject Sponsorship Error:', err);
    res.status(500).json({ success: false, error: "Server Protocol Rejection Failed" });
  }
};

export const getPendingSponsorships = async (req, res) => {
  try {
    const userId = req.user.id;
    const pending = await prisma.sponsorship.findMany({
      where: { targetStudentId: userId, status: 'pending_consent' },
      select: {
        id: true,
        sponsorName: true,
        amount: true,
        isAnonymous: true,
        createdAt: true
      }
    });

    res.status(200).json({ success: true, data: pending });
  } catch (err) {
    console.error('Fetch Pending Sponsorship Error:', err);
    res.status(500).json({ success: false, error: "Server Protocol Fetch Failed" });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const existingSponsorships = await prisma.sponsorship.count();
    if (existingSponsorships === 0) {
      console.log('Seeding initial sponsorships...');
      const students = await prisma.user.findMany({
        where: { role: 'student' },
        take: 3,
        include: { userCourseProgress: { include: { course: true } } }
      });

      if (students.length > 0) {
        await prisma.sponsorship.createMany({
          data: [
            { sponsorName: 'TechCorp Inc.', amount: 4500, targetStudentId: students[0].id, status: 'active' },
            { sponsorName: 'Anonymous', amount: 1200, targetStudentId: students[1] ? students[1].id : students[0].id, status: 'active' },
            { sponsorName: 'GlobalEdu Fund', amount: 850, targetStudentId: students[2] ? students[2].id : students[0].id, status: 'completed' }
          ]
        });
        
        await prisma.impactLog.createMany({
          data: [
            { sponsorName: 'TechCorp Inc.', studentName: students[0].name, type: 'Donated 1 Macbook Pro' },
            { sponsorName: 'Anonymous', studentName: students[1] ? students[1].name : students[0].name, type: 'Provided full tuition for Web Dev Course' }
          ]
        });
      }
    }

    const user = req.user;
    const roleLimit = user?.role === 'sponsor' ? { sponsorId: user.id } : {};

    const sponsorships = await prisma.sponsorship.findMany({ where: roleLimit });
    const totalContributions = sponsorships.reduce((sum, s) => sum + s.amount, 0);
    const activeSponsors = new Set(sponsorships.filter(s => s.status === 'active').map(s => s.sponsorName)).size;
    const supportedStudentsCount = new Set(sponsorships.filter(s => s.targetStudentId).map(s => s.targetStudentId)).size;
    const activeCycles = sponsorships.filter(s => s.status === 'active').length;

    const activeSponsorshipsWithStudents = await prisma.sponsorship.findMany({
      where: { 
        ...roleLimit,
        targetStudentId: { not: null } 
      },
      include: {
        targetStudent: {
          include: {
            userCourseProgress: {
              include: { course: true }
            }
          }
        }
      }
    });

    const studentsMap = new Map();
    activeSponsorshipsWithStudents.forEach(s => {
      const student = s.targetStudent;
      if (!student) return;
      
      const latestProgress = student.userCourseProgress.length > 0 ? student.userCourseProgress[student.userCourseProgress.length - 1] : null;
      
      let status = s.status === 'completed' ? 'completed' : 'active';
      let progressVal = latestProgress ? latestProgress.progress : 0;
      
      if (progressVal < 30 && status !== 'completed') status = 'at-risk';
      
      studentsMap.set(student.id, {
        id: student.id,
        name: student.name,
        course: latestProgress ? latestProgress.course.title : 'General Studies',
        progress: progressVal,
        status: status,
        avatar: getAvatarColor(student.name)
      });
    });

    const supportedStudents = Array.from(studentsMap.values());

    const logs = await prisma.impactLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const recentImpact = logs.map(l => ({
      id: l.id,
      sponsor: l.sponsorName,
      student: l.studentName,
      type: l.type,
      date: formatTimeAgo(l.createdAt)
    }));

    let currentCycle = null;
    if (activeSponsorshipsWithStudents.length > 0) {
      const activeSponsorship = activeSponsorshipsWithStudents.find(s => s.status === 'active') || activeSponsorshipsWithStudents[0];
      const student = activeSponsorship.targetStudent;
      const latestProgress = student?.userCourseProgress.length > 0 ? student.userCourseProgress[student.userCourseProgress.length - 1] : null;      
      
      currentCycle = {
        studentName: student?.name || 'Anonymous Student',
        courseName: latestProgress ? latestProgress.course.title : 'General Cohort',
        progress: latestProgress ? latestProgress.progress : 0,
        funded: 100
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalContributions,
          activeSponsors,
          supportedStudents: supportedStudentsCount,
          activeCycles
        },
        supportedStudents,
        recentImpact,
        currentCycle
      }
    });
  } catch (err) {
    console.error('Failed to fetch support dashboard data:', err);
    res.status(500).json({ success: false, message: 'Server error fetching support data' });
  }
};

function getAvatarColor(name) {
  const colors = [
    'bg-indigo-500/20 text-indigo-500', 
    'bg-emerald-500/20 text-emerald-500', 
    'bg-cyan-500/20 text-cyan-500', 
    'bg-amber-500/20 text-amber-500'
  ];
  return colors[name.length % colors.length];
}

function formatTimeAgo(date) {
  const diffHours = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60));
  if (diffHours < 24) return 'Today';
  return `${Math.floor(diffHours / 24)} days ago`;
}
