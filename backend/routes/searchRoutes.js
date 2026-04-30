import express from 'express';
import { prisma } from '../lib/prisma.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route GET /api/search/global?q=...
 * @desc Search across users, courses, and notices dynamically.
 * @access Private (Filters based on role internally if needed, but primarily returns unified object)
 */
router.get('/global', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const searchKeyword = q.trim();
    const results = [];

    const users = await prisma.user.findMany({
        where: { name: { contains: searchKeyword, mode: 'insensitive' } },
        select: { name: true, role: true, email: true, avatar: true, id: true },
        take: 15
    });
    
    users.forEach(u => {
      const type = u.role === 'admin' ? 'System' :
                   u.role === 'instructor' ? 'Instructor' :
                   u.role === 'parent' ? 'Parent' : 'Student';
      
      results.push({
        type: type,
        title: u.name,
        subtitle: u.email,
        id: u.id,
        path: '/dashboard/users' // They can click users to go to the global user mgmt list!
      });
    });

    const courses = await prisma.course.findMany({
        where: { title: { contains: searchKeyword, mode: 'insensitive' } },
        select: { title: true, description: true, id: true },
        take: 10
    });
    
    courses.forEach(c => {
      results.push({
        type: 'Course',
        title: c.title,
        subtitle: c.description ? c.description.substring(0, 40) + '...' : '',
        id: c.id,
        path: '/dashboard/courses'
      });
    });

    const notices = await prisma.notice.findMany({
        where: { title: { contains: searchKeyword, mode: 'insensitive' } },
        select: { title: true, id: true },
        take: 5
    });
    
    notices.forEach(n => {
      results.push({
        type: 'Notice',
        title: n.title,
        subtitle: 'Platform Announcement',
        id: n.id,
        path: '/dashboard/notice'
      });
    });

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error('Global Search Error:', error);
    res.status(500).json({ success: false, message: 'Server search error' });
  }
});

export default router;
