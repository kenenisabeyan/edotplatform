import express from 'express';
import { getMyAchievements, getChildAchievements } from '../controllers/achievementController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, getMyAchievements);
router.get('/children', protect, authorize('parent', 'admin'), getChildAchievements);

export default router;
