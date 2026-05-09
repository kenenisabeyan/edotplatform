import express from 'express';
import { 
  getDashboardData, 
  getMessages, 
  supportStudent 
} from '../controllers/sponsorController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const sponsorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'sponsor') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as sponsor' });
  }
};

router.use(protect, sponsorOnly);

router.get('/dashboard', getDashboardData);
router.get('/messages', getMessages);
router.post('/support-student', supportStudent);

export default router;
