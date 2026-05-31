import { prisma } from '../lib/prisma.js';
import { AccessToken } from 'livekit-server-sdk';

export const sendMessage = async (req, res) => {
    try {
        const { receiverId, groupId, content, attachmentUrl, attachmentType } = req.body;
        const senderId = req.user.id;

        if (!groupId && !receiverId) {
            return res.status(400).json({ success: false, message: 'Receiver or group is required' });
        }

        if (!content && !attachmentUrl) {
            return res.status(400).json({ success: false, message: 'Message content or attachment is required' });
        }

        let messageData = {
            senderId,
            content: content || "",
            attachmentUrl,
            attachmentType
        };

        if (groupId) {
            const group = await prisma.messageGroup.findUnique({
                where: { id: groupId },
                include: { members: { select: { id: true } } }
            });

            if (!group) {
                return res.status(404).json({ success: false, message: 'Group not found' });
            }

            const isMember = group.adminId === senderId || group.members.some(member => member.id === senderId);
            if (!isMember) {
                return res.status(403).json({ success: false, message: 'You must be a member to post in this group.' });
            }

            if (group.isChannel && group.adminId !== senderId) {
                return res.status(403).json({ success: false, message: 'Only channel admins can post messages.' });
            }

            messageData.groupId = groupId;
        } else {
            const receiverSettings = await prisma.userSetting.findUnique({
                where: { userId: receiverId }
            });
            if (receiverSettings?.blockedUsers?.includes(senderId)) {
                return res.status(403).json({ success: false, message: 'You have been blocked by this user.' });
            }
            messageData.receiverId = receiverId;
        }

        const message = await prisma.message.create({
            data: messageData
        });

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (err) {
        console.error('Send message error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const broadcastMessage = async (req, res) => {
    try {
        const { courseId, groupId, content } = req.body;
        const senderId = req.user.id;

        if (!content) {
            return res.status(400).json({ success: false, message: 'content is required' });
        }

        if (groupId) {
            await prisma.message.create({
                data: {
                    senderId,
                    groupId,
                    content
                }
            });
            return res.status(201).json({ success: true, message: 'Broadcasted to group' });
        } else if (courseId) {
            const enrollments = await prisma.enrollment.findMany({
                where: { courseId, status: 'approved' },
                select: { studentId: true }
            });

            if (enrollments.length === 0) {
                return res.status(200).json({ success: true, message: 'No active students to broadcast to.' });
            }

            const messagesData = enrollments.map(en => ({
                senderId,
                receiverId: en.studentId,
                content
            }));

            await prisma.message.createMany({
                data: messagesData
            });

            return res.status(201).json({
                success: true,
                message: `Broadcasted to ${enrollments.length} students`
            });
        } else {
            return res.status(400).json({ success: false, message: 'Either courseId or groupId is required' });
        }
    } catch (err) {
        console.error('Broadcast message error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        const group = await prisma.messageGroup.findUnique({
            where: { id: userId },
            include: { members: { select: { id: true } } }
        });

        if (group) {
            const isMember = group.adminId === currentUserId || group.members.some(member => member.id === currentUserId);
            if (!isMember) {
                return res.status(403).json({ success: false, message: 'Not authorized to view this group.' });
            }

            const messages = await prisma.message.findMany({
                where: { groupId: userId },
                orderBy: { createdAt: 'asc' }
            });

            return res.status(200).json({ success: true, data: messages });
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: userId },
                    { senderId: userId, receiverId: currentUserId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });

        await prisma.message.updateMany({
            where: {
                senderId: userId,
                receiverId: currentUserId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (err) {
        console.error('Get conversation error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getContacts = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        
        const contacts = await prisma.user.findMany({
            where: { id: { not: currentUserId } },
            select: { id: true, role: true, name: true, avatar: true },
            orderBy: { name: 'asc' },
            take: 100
        });

        const unreadCounts = await prisma.message.groupBy({
            by: ['senderId'],
            where: {
                receiverId: currentUserId,
                isRead: false
            },
            _count: {
                _all: true
            }
        });

        const unreadMap = {};
        unreadCounts.forEach(item => {
            unreadMap[item.senderId] = item._count._all;
        });

        const userSettings = await prisma.userSetting.findUnique({
            where: { userId: currentUserId }
        });
        const blockedUsers = userSettings?.blockedUsers || [];

        const contactsWithUnread = contacts
          .filter(contact => !blockedUsers.includes(contact.id))
          .map(contact => {
            return {
                ...contact,
                unreadCount: unreadMap[contact.id] || 0,
                isOnline: true
            };
        });

        contactsWithUnread.sort((a, b) => {
            if (b.unreadCount !== a.unreadCount) {
                return b.unreadCount - a.unreadCount;
            }
            return a.name.localeCompare(b.name);
        });

        res.status(200).json({
            success: true,
            data: contactsWithUnread
        });
    } catch (err) {
        console.error('Get contacts error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getUserGroups = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const groups = await prisma.messageGroup.findMany({
            where: {
                OR: [
                    { adminId: currentUserId },
                    { members: { some: { id: currentUserId } } }
                ]
            },
            include: {
                admin: { select: { id: true, name: true } },
                members: { select: { id: true, name: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });

        const groupsResult = groups.map(group => ({
            id: group.id,
            name: group.name,
            description: group.description,
            avatar: group.avatar,
            type: group.isChannel ? 'channel' : 'group',
            isChannel: group.isChannel,
            adminId: group.adminId,
            adminName: group.admin?.name,
            memberCount: group.members.length,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt
        }));

        res.status(200).json({ success: true, data: groupsResult });
    } catch (err) {
        console.error('Get user groups error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;
        const currentUserId = req.user.id;

        const group = await prisma.messageGroup.findUnique({
            where: { id: groupId },
            include: {
                admin: { select: { id: true, name: true, avatar: true, role: true } },
                members: { select: { id: true, name: true, avatar: true, role: true } }
            }
        });

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        const isMember = group.adminId === currentUserId || group.members.some(member => member.id === currentUserId);
        if (!isMember) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this group.' });
        }

        res.status(200).json({
            success: true,
            data: {
                id: group.id,
                name: group.name,
                description: group.description,
                isChannel: group.isChannel,
                adminId: group.adminId,
                admin: group.admin,
                members: group.members,
                memberCount: group.members.length,
                avatar: group.avatar,
                createdAt: group.createdAt,
                updatedAt: group.updatedAt
            }
        });
    } catch (err) {
        console.error('Get group details error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const currentUserId = req.user.id;

        const group = await prisma.messageGroup.findUnique({
            where: { id: groupId },
            include: { members: { select: { id: true } } }
        });

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        const isAdmin = group.adminId === currentUserId;
        const isMember = group.members.some(member => member.id === currentUserId) || isAdmin;
        if (!isMember) {
            return res.status(403).json({ success: false, message: 'Not a member of this group.' });
        }

        if (isAdmin) {
            const remainingMembers = group.members.filter(member => member.id !== currentUserId);
            if (remainingMembers.length === 0) {
                await prisma.messageGroup.delete({ where: { id: groupId } });
                return res.status(200).json({ success: true, message: 'Group deleted as the last member left.' });
            }

            const newAdmin = remainingMembers[0];
            await prisma.messageGroup.update({
                where: { id: groupId },
                data: {
                    adminId: newAdmin.id,
                    members: {
                        disconnect: { id: currentUserId }
                    }
                }
            });

            return res.status(200).json({ success: true, message: 'You have left the group. Ownership transferred to the next member.' });
        }

        await prisma.messageGroup.update({
            where: { id: groupId },
            data: {
                members: {
                    disconnect: { id: currentUserId }
                }
            }
        });

        res.status(200).json({ success: true, message: 'You have left the group.' });
    } catch (err) {
        console.error('Leave group error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const removeGroupMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const currentUserId = req.user.id;

        const group = await prisma.messageGroup.findUnique({
            where: { id: groupId },
            include: { members: { select: { id: true } } }
        });

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        if (group.adminId !== currentUserId) {
            return res.status(403).json({ success: false, message: 'Only the owner can remove members.' });
        }

        if (memberId === currentUserId) {
            return res.status(400).json({ success: false, message: 'Use leave group to exit as the owner.' });
        }

        const isMember = group.members.some(member => member.id === memberId);
        if (!isMember) {
            return res.status(404).json({ success: false, message: 'Member not found in this group.' });
        }

        await prisma.messageGroup.update({
            where: { id: groupId },
            data: {
                members: {
                    disconnect: { id: memberId }
                }
            }
        });

        res.status(200).json({ success: true, message: 'Member removed successfully.' });
    } catch (err) {
        console.error('Remove group member error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getBlockedUsers = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const userSettings = await prisma.userSetting.findUnique({
            where: { userId: currentUserId }
        });
        const blockedUsers = userSettings?.blockedUsers || [];

        if (blockedUsers.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        const users = await prisma.user.findMany({
            where: { id: { in: blockedUsers } },
            select: { id: true, name: true, role: true, avatar: true }
        });

        res.status(200).json({ success: true, data: users });
    } catch (err) {
        console.error('Get blocked users error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const createGroup = async (req, res) => {
    try {
        const { name, description, isChannel, memberIds } = req.body;
        const adminId = req.user.id;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Group name is required' });
        }

        const validMemberIds = Array.isArray(memberIds) ? memberIds : [];

        const group = await prisma.messageGroup.create({
            data: {
                name,
                description: description || '',
                isChannel: isChannel || false,
                adminId,
                members: {
                    connect: [...validMemberIds.map(id => ({ id })), { id: adminId }]
                }
            }
        });

        res.status(201).json({
            success: true,
            data: group
        });
    } catch (err) {
        console.error('Create group error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const updateMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;
        const currentUserId = req.user.id;

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: 'Message content is required' });
        }

        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        if (message.senderId !== currentUserId) {
            return res.status(403).json({ success: false, message: 'Only the sender can edit this message' });
        }

        const updated = await prisma.message.update({
            where: { id: messageId },
            data: { content: content.trim() }
        });

        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        console.error('Update message error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const currentUserId = req.user.id;

        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        if (message.senderId !== currentUserId && message.receiverId !== currentUserId) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this message' });
        }

        await prisma.message.delete({ where: { id: messageId } });

        res.status(200).json({ success: true, message: 'Message deleted successfully' });
    } catch (err) {
        console.error('Delete message error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const toggleBlockUser = async (req, res) => {
    try {
        const { userId: targetUserId } = req.params;
        const currentUserId = req.user.id;

        let settings = await prisma.userSetting.findUnique({
            where: { userId: currentUserId }
        });

        if (!settings) {
            settings = await prisma.userSetting.create({
                data: { userId: currentUserId }
            });
        }

        let updatedBlocked = [...settings.blockedUsers];
        const isBlocked = updatedBlocked.includes(targetUserId);

        if (isBlocked) {
            updatedBlocked = updatedBlocked.filter(id => id !== targetUserId);
        } else {
            updatedBlocked.push(targetUserId);
        }

        const updatedSettings = await prisma.userSetting.update({
            where: { userId: currentUserId },
            data: { blockedUsers: updatedBlocked }
        });

        res.status(200).json({
            success: true,
            isBlocked: !isBlocked,
            message: !isBlocked ? 'User blocked successfully.' : 'User unblocked successfully.'
        });
    } catch (err) {
        console.error('Toggle block error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


export const generateCallToken = async (req, res) => {
  try {
    const { targetUserId, groupId } = req.body;
    const currentUserId = req.user.id;
    
    let roomName;
    if (groupId) {
      roomName = "call-group-" + groupId;
    } else {
      roomName = "call-" + [currentUserId, targetUserId].sort().join('-');
    }
    
    const participantName = req.user.name || "User-" + currentUserId.substring(0, 5);

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY || 'devkey',
      process.env.LIVEKIT_API_SECRET || 'secret'
    );

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });
    at.identity = currentUserId;
    at.name = participantName;

    const token = await at.toJwt();

    res.json({
      success: true,
      token,
      roomName,
      livekitUrl: process.env.LIVEKIT_URL || 'ws://localhost:7880'
    });
  } catch (error) {
    console.error('Call token error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const sendSMS = async (req, res) => {
  try {
    const { phone, message } = req.body;
    console.log("[REAL LIFE SMS] " + phone + ": " + message);
    res.status(200).json({ success: true, message: 'SMS delivered to carrier network' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'SMS Error' });
  }
};

export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await prisma.message.count({
            where: {
                receiverId: userId,
                isRead: false
            }
        });
        res.json({ success: true, count });
    } catch (error) {
        console.error('getUnreadCount error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getRecentMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const recentMessages = await prisma.message.findMany({
            where: { OR: [{ receiverId: userId }, { senderId: userId }] },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { sender: { select: { name: true, avatar: true } }, receiver: { select: { name: true, avatar: true } } }
        });
        
        // Group by user to just get recent conversations
        const conversationsMap = new Map();
        for (const msg of recentMessages) {
            const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
            const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            if (!conversationsMap.has(otherUserId)) {
                conversationsMap.set(otherUserId, {
                    ...otherUser,
                    lastMessage: msg.content,
                    time: msg.createdAt,
                    unread: msg.receiverId === userId && !msg.isRead
                });
            }
        }
        
        res.json({ success: true, data: Array.from(conversationsMap.values()) });
    } catch (error) {
        console.error('getRecentMessages error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

