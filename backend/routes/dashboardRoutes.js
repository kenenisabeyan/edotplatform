import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', dashboardController.getAdminStats.bind(dashboardController));

export default router;
