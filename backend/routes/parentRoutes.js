import express from 'express';
import { getParentDashboardStats, getParentLearners, getParentStudentInsights, getParentStudentInvoice } from '../controllers/parentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('parent'));

router.get('/dashboard', getParentDashboardStats);
router.get('/learners', getParentLearners);

router.get('/student/:id/insights', getParentStudentInsights);
router.get('/student/:id/invoice', getParentStudentInvoice);

router.get('/analytics/detailed', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            revenueData: [],
            engagementData: [],
            courseCompletionData: [],
            totalRevenue: 0,
            totalActiveLearners: 1,
            totalCourseCompletions: 0
        }
    });
});

export default router;
