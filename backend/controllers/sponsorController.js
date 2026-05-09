import { prisma } from '../lib/prisma.js';

export const getDashboardData = async (req, res) => {
  try {
    const sponsorId = req.user.id;

    // Get sponsor data
    const sponsor = await prisma.user.findUnique({
      where: { id: sponsorId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true
      }
    });

    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }

    // Get sponsorship stats
    const sponsorships = await prisma.sponsorship.findMany({
      where: { sponsorId },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        targetStudent: {
          select: {
            id: true,
            name: true,
            avatar: true,
            courseTitle: true,
            progress: true
          }
        }
      }
    });

    // Calculate stats
    const totalContributions = sponsorships.reduce((sum, s) => sum + s.amount, 0);
    const activeSponsors = 1; // Current sponsor
    const supportedStudents = sponsorships.filter(s => s.status === 'active').length;
    const activeSupportCycles = sponsorships.filter(s => s.status === 'active').length;

    // Get human impact data
    const activeSponsorships = sponsorships.filter(s => s.status === 'active');
    const studentsSupported = activeSponsorships.length;
    const coursesCompleted = activeSponsorships.reduce((sum, s) => sum + (s.targetStudent?.progress || 0), 0);
    const livesInProgress = activeSponsorships.length;

    // Format supported students
    const supportedStudentsData = activeSponsorships.map(s => ({
      id: s.targetStudent?.id,
      name: s.targetStudent?.name,
      courseTitle: s.targetStudent?.courseTitle,
      progress: s.targetStudent?.progress || 0,
      supportStatus: s.status
    }));

    // Get recent impact (mock data for now)
    const recentImpact = sponsorships.slice(0, 5).map(s => ({
      id: s.id,
      type: 'Sponsorship Started',
      studentName: s.targetStudent?.name,
      createdAt: s.createdAt
    }));

    res.json({
      sponsor,
      stats: {
        totalContributions,
        activeSponsors,
        supportedStudents,
        activeSupportCycles
      },
      humanImpact: {
        studentsSupported,
        coursesCompleted,
        livesInProgress
      },
      supportedStudents: supportedStudentsData,
      recentImpact
    });
  } catch (error) {
    console.error('Error fetching sponsor dashboard data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const sponsorId = req.user.id;

    // Get message groups for this sponsor
    const messageGroups = await prisma.messageGroup.findMany({
      where: {
        members: {
          some: { id: sponsorId }
        }
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            content: true,
            createdAt: true,
            sender: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ messageGroups });
  } catch (error) {
    console.error('Error fetching sponsor messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const supportStudent = async (req, res) => {
  try {
    const { studentId, amount, type } = req.body;
    const sponsorId = req.user.id;

    if (!studentId || !amount) {
      return res.status(400).json({ message: 'Student ID and amount are required' });
    }

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, role: true }
    });

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if sponsorship already exists
    const existingSponsorship = await prisma.sponsorship.findFirst({
      where: {
        sponsorId,
        targetStudentId: studentId,
        status: { in: ['active', 'pending_consent'] }
      }
    });

    if (existingSponsorship) {
      return res.status(400).json({ message: 'Sponsorship already exists for this student' });
    }

    // Create message channel
    const messageChannel = await prisma.messageGroup.create({
      data: {
        name: `Sponsor-Student Channel`,
        description: 'Private communication channel for sponsorship',
        isChannel: false,
        adminId: sponsorId,
        members: {
          connect: [{ id: sponsorId }, { id: studentId }]
        }
      }
    });

    // Create sponsorship
    const sponsorship = await prisma.sponsorship.create({
      data: {
        sponsorId,
        targetStudentId: studentId,
        amount: Number(amount),
        type: type || 'General Support',
        messageChannelId: messageChannel.id,
        status: 'pending_consent'
      }
    });

    res.status(201).json({
      message: 'Sponsorship initiated successfully',
      sponsorship
    });
  } catch (error) {
    console.error('Error creating sponsorship:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};