import { prisma } from '../lib/prisma.js';

export const getMyAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    let achievement = await prisma.achievement.findUnique({ where: { userId } });
    if (!achievement) {
      achievement = await prisma.achievement.create({ data: { userId } });
    }
    res.status(200).json({ success: true, data: achievement });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

export const getChildAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { children: true }
    });

    if (!user || user.role !== 'parent') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const childIds = user.children.map(child => child.id);
    const achievements = await prisma.achievement.findMany({
      where: { userId: { in: childIds } },
      include: { user: { select: { name: true } } }
    });

    const filteredAchievements = achievements.map(ach => {
      const badges = ach.badges ? (Array.isArray(ach.badges) ? ach.badges : [ach.badges]) : [];
      return {
        ...ach,
        badges: badges.filter(b => b.visibility === 'public')
      };
    });

    res.status(200).json({ success: true, data: filteredAchievements });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};


