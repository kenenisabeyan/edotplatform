import express from 'express';
import { getExpenses, createExpense } from '../controllers/expenseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), getExpenses)
  .post(protect, authorize('admin'), createExpense);

export default router;
