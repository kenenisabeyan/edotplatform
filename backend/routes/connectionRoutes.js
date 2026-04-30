import express from 'express';
import { 
   requestConnection, 
   getPendingConnections, 
   acceptConnection, 
   rejectConnection 
} from '../controllers/connectionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('parent', 'admin'), requestConnection);

router.get('/pending', protect, getPendingConnections);

router.post('/:connectionId/accept', protect, acceptConnection);
router.post('/:connectionId/reject', protect, rejectConnection);

export default router;
