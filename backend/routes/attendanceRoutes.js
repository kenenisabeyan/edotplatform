import express from 'express';
import { 
  getCourseAttendance,
  submitAttendance,
  getDashboardAggregate,
  submitFinalReport,
  getFinalReports,
  getAttendanceByQuery,
  getEnrolledUsers,
  submitSelfAttendance,
  getAllAttendances
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/aggregate')
  .get(getDashboardAggregate);

router.route('/all')
  .get(getAllAttendances);

router.route('/reports')
  .get(getFinalReports);

router.route('/report')
  .post(submitFinalReport);

router.route('/users')
  .get(getEnrolledUsers);

router.route('/')
  .get(getAttendanceByQuery)
  .post(submitAttendance);

router.route('/self')
  .post(submitSelfAttendance);

router.route('/section/:sectionId')
  .get(getCourseAttendance);

export default router;
