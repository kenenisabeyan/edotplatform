import express from 'express';
import { getMyActivities, getAllActivities, getInsightsForParent, flagActivity, createActivity } from '../controllers/activityController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getMyActivities);
router.post('/', protect, createActivity);
router.get('/insights', protect, authorize('parent', 'admin'), getInsightsForParent);
router.put('/:id/flag', protect, authorize('instructor', 'admin'), flagActivity);
router.get('/all', protect, authorize('admin'), getAllActivities);

export default router;
