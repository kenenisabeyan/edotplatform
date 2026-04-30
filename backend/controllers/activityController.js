import { prisma } from '../lib/prisma.js';

export const logActivity = async (userId, action, type = 'system', details = null, relatedId = null, visibility = 'public', insightFlag = null, metadata = null) => {
  try {
    if (!userId) return; // Need user to log against
    const data = {
      userId,
      action,
      type,
      visibility,
    };
    if (details) data.details = details;
    if (relatedId) data.relatedId = relatedId;
    if (insightFlag) data.insightFlag = insightFlag;
    if (metadata) data.metadata = metadata;
    
    await prisma.activity.create({ data });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

export const getMyActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error fetching personal activities', error: error.message });
  }
};

export const getAllActivities = async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        user: { select: { name: true, role: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error fetching all activities', error: error.message });
  }
};

export const getInsightsForParent = async (req, res) => {
  try {
    const parent = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { children: { select: { id: true } } }
    });
    
    const childrenIds = parent?.children?.map(c => c.id) || [];

    const insights = await prisma.activity.findMany({
      where: {
        userId: { in: childrenIds },
        visibility: 'insight'
      },
      select: {
        id: true,
        userId: true,
        action: true,
        type: true,
        relatedId: true,
        visibility: true,
        insightFlag: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { name: true, role: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.status(200).json({ success: true, data: insights });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error fetching insights', error: error.message });
  }
};

export const flagActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { insightFlag } = req.body; // 'achievement' or 'concern'

    const activity = await prisma.activity.findUnique({ where: { id } });
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: {
        visibility: 'insight',
        insightFlag
      }
    });

    if (insightFlag === 'achievement') {
      let ach = await prisma.achievement.findUnique({ where: { userId: activity.userId } });
      
      const newBadge = {
        title: 'Instructor Acknowledgment',
        description: activity.action,
        iconType: 'star'
      };

      if (!ach) {
        ach = await prisma.achievement.create({
          data: {
            userId: activity.userId,
            learningPoints: 50,
            badges: [newBadge]
          }
        });
      } else {
        const badgesArray = ach.badges ? (Array.isArray(ach.badges) ? ach.badges : [ach.badges]) : [];
        badgesArray.push(newBadge);
        ach = await prisma.achievement.update({
          where: { id: ach.id },
          data: {
            learningPoints: (ach.learningPoints || 0) + 50,
            badges: badgesArray
          }
        });
      }
    }

    res.status(200).json({ success: true, data: updatedActivity, message: 'Activity promoted to an insight successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error flagging activity', error: error.message });
  }
};

export const createActivity = async (req, res) => {
  try {
    const { action, type, details, relatedId, visibility, insightFlag, metadata } = req.body;
    const userId = req.user.id;
    
    const data = {
      userId,
      action,
      type: type || 'system',
      visibility: visibility || 'private',
    };
    if (details) data.details = details;
    if (relatedId) data.relatedId = relatedId;
    if (insightFlag) data.insightFlag = insightFlag;
    if (metadata) data.metadata = metadata;
    
    const activity = await prisma.activity.create({ data });
    
    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error creating activity', error: error.message });
  }
};

