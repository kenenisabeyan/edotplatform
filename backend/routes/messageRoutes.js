import express from 'express';
import { sendMessage, getConversation, getContacts, getUserGroups, createGroup, getGroupDetails, leaveGroup, removeGroupMember, toggleBlockUser, getBlockedUsers, updateMessage, deleteMessage, generateCallToken, sendSMS } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/call-token', generateCallToken);
router.post('/sms', sendSMS);

router.post('/', sendMessage);
router.put('/:messageId', updateMessage);
router.delete('/:messageId', deleteMessage);
router.post('/groups', createGroup);
router.get('/groups/:groupId', getGroupDetails);
router.post('/groups/:groupId/leave', leaveGroup);
router.delete('/groups/:groupId/members/:memberId', removeGroupMember);
router.post('/block/:userId', toggleBlockUser);
router.get('/groups', getUserGroups);
router.get('/blocked', getBlockedUsers);
router.get('/conversation/:userId', getConversation);
router.get('/contacts', getContacts);

import { getUnreadCount, getRecentMessages } from '../controllers/messageController.js';
router.get('/unread/count', getUnreadCount);
router.get('/recent', getRecentMessages);

export default router;
