import express from 'express';
import { getDashboardData, supportStudent, acceptSponsorship, rejectSponsorship, getPendingSponsorships } from '../controllers/supportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, authorize('sponsor', 'admin'), getDashboardData);

router.post('/', protect, authorize('sponsor', 'admin'), supportStudent);

router.get('/pending', protect, authorize('student', 'admin'), getPendingSponsorships);

router.post('/:sponsorshipId/accept', protect, authorize('student', 'admin'), acceptSponsorship);
router.post('/:sponsorshipId/reject', protect, authorize('student', 'admin'), rejectSponsorship);

export default router;
