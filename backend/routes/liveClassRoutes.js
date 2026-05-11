import express from 'express';
import {
  getLiveClasses,
  createLiveClass,
  joinLiveClass,
  markClassCompleted,
  getClassAttendance,
  uploadRecording,
  getRecordings,
  getSignedPlaybackUrl
} from '../controllers/liveClassController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/recordings/:id/play')
  .get(protect, getSignedPlaybackUrl);

router.route('/recordings')
  .get(protect, getRecordings)
  .post(protect, uploadRecording);

router.route('/')
  .get(protect, getLiveClasses)
  .post(protect, createLiveClass);

router.route('/:id/join')
  .post(protect, joinLiveClass);

router.route('/:id/complete')
  .post(protect, markClassCompleted);

router.route('/:id/attendance')
  .get(protect, getClassAttendance);

export default router;
