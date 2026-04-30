import express from 'express';
import { createMaterial, getMaterialsByLesson, deleteMaterial } from '../controllers/materialController.js';
import { protect, authorize, guardActiveEnrollment, checkNotBlocked } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'teacher', 'instructor'), createMaterial);
router.get('/:lessonId', protect, checkNotBlocked, guardActiveEnrollment, getMaterialsByLesson);
router.delete('/:id', protect, authorize('admin', 'teacher', 'instructor'), deleteMaterial);

export default router;
