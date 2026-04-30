import express from 'express';
import { createQuiz, getQuizzesByLesson } from '../controllers/quizController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'teacher', 'instructor'), createQuiz);
router.get('/:lessonId', protect, getQuizzesByLesson);

export default router;
