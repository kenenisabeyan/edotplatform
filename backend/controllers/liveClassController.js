import { prisma } from '../lib/prisma.js';
import { google } from 'googleapis';
import { v2 as cloudinary } from 'cloudinary';
import { AccessToken } from 'livekit-server-sdk';

// In a real app, you would have OAuth flows. For this integration,
// we'll assume there's a service account or an authenticated OAuth2 client.
// We'll set up a dummy client that fails gracefully if credentials aren't set.
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
  process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/live-classes/oauth2callback'
);

if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
}

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

const isValidGoogleMeetUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /^https:\/\/meet\.google\.com\/[a-zA-Z0-9-]+(?:\?.*)?$/.test(url.trim());
};

const isValidZoomUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /^https:\/\/([\w.-]+\.)?zoom\.us\/(j|my)\/[A-Za-z0-9?=&#%_\-./]+$/.test(url.trim());
};

const createLiveClassNotificationForRecipients = async ({ req, userIds, title, message, actionUrl, liveClassId, type = 'live_class' }) => {
  if (!Array.isArray(userIds) || userIds.length === 0) return;

  const notificationData = userIds.map((userId) => ({
    userId,
    type,
    title,
    message,
    relatedEntityType: 'liveClass',
    relatedEntityId: liveClassId,
    actionUrl
  }));

  try {
    await prisma.notification.createMany({ data: notificationData });
  } catch (error) {
    console.error('Failed to persist live class notifications:', error);
  }

  if (req.io) {
    userIds.forEach((userId) => {
      req.io.to(`user_${userId}`).emit('notification', {
        title,
        message,
        type,
        actionUrl,
        relatedEntityType: 'liveClass',
        relatedEntityId: liveClassId
      });
    });
  }
};

const notifyCourseStudents = async (req, liveClass, event) => {
  const enrollmentRecords = await prisma.enrollment.findMany({
    where: {
      courseId: liveClass.courseId,
      status: 'active'
    },
    select: { studentId: true }
  });

  const studentIds = enrollmentRecords.map((record) => record.studentId);
  if (studentIds.length === 0) return;

  let title = '';
  let message = '';
  let actionUrl = `/dashboard/live-classes`;

  if (event === 'scheduled') {
    title = `Live class scheduled: ${liveClass.title}`;
    message = `A new session is scheduled for ${new Date(liveClass.scheduledAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}. Join from your dashboard.`;
    actionUrl = `/dashboard/live-classes?join=${liveClass.id}`;
  } else if (event === 'started') {
    title = `Live session started: ${liveClass.title}`;
    message = `Your class is now live. Join the session from your dashboard.`;
    actionUrl = `/dashboard/live-classes?join=${liveClass.id}`;
  } else if (event === 'ended') {
    title = `Live session ended: ${liveClass.title}`;
    message = `The session has finished. Check the replay or classroom updates.`;
  } else {
    return;
  }

  await createLiveClassNotificationForRecipients({
    req,
    userIds: studentIds,
    title,
    message,
    actionUrl,
    liveClassId: liveClass.id,
    type: `live_class_${event}`
  });
};

export const getLiveClasses = async (req, res) => {
  try {
    const liveClasses = await prisma.liveClass.findMany({
      include: {
        instructor: {
          select: { id: true, name: true, avatar: true, email: true }
        },
        course: {
          select: {
            id: true,
            title: true,
            instructorId: true,
            instructor: { select: { id: true, name: true, avatar: true, email: true } }
          }
        },
        section: {
          select: { id: true, name: true, sectionCode: true }
        },
        attendances: {
          include: {
            student: { select: { id: true, name: true, avatar: true, email: true } }
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });
    
    res.json({ success: true, liveClasses });
  } catch (error) {
    console.error('Error fetching live classes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createLiveClass = async (req, res) => {
  try {
    const { courseId, sectionId, title, description, scheduledAt, durationMinutes, platform, meetLink } = req.body;
    const instructorId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Please select a course to schedule this live class.' });
    }

    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only instructors or admins can schedule classes' });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: { select: { id: true, name: true, email: true, avatar: true } }
      }
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Selected course not found.' });
    }

    if (req.user.role === 'instructor' && course.instructorId !== instructorId) {
      return res.status(403).json({ success: false, message: 'You can only schedule live classes for your own courses.' });
    }

    let finalMeetLink = null;
    let googleEventId = null;
    const chosenPlatform = platform || 'studio';
    let validatedSectionId = null;

    if (sectionId) {
      const section = await prisma.section.findUnique({ where: { id: sectionId } });
      if (!section) {
        return res.status(404).json({ success: false, message: 'Selected section not found.' });
      }
      if (section.courseId !== courseId) {
        return res.status(400).json({ success: false, message: 'Selected section does not belong to the chosen course.' });
      }
      if (req.user.role === 'instructor' && section.instructorId !== instructorId) {
        return res.status(403).json({ success: false, message: 'You can only schedule live classes for sections you manage.' });
      }
      validatedSectionId = sectionId;
    }

    if (chosenPlatform === 'google_meet') {
      if (meetLink && meetLink.trim()) {
        const candidate = meetLink.trim();
        if (!isValidGoogleMeetUrl(candidate)) {
          return res.status(400).json({ success: false, message: 'Please provide a valid Google Meet URL.' });
        }
        finalMeetLink = candidate;
      } else if (process.env.GOOGLE_REFRESH_TOKEN) {
        try {
          const event = {
            summary: title,
            description: description,
            start: {
              dateTime: new Date(scheduledAt).toISOString(),
              timeZone: 'Africa/Addis_Ababa',
            },
            end: {
              dateTime: new Date(new Date(scheduledAt).getTime() + durationMinutes * 60000).toISOString(),
              timeZone: 'Africa/Addis_Ababa',
            },
            conferenceData: {
              createRequest: {
                requestId: `edot-meet-${Date.now()}`,
                conferenceSolutionKey: { type: 'hangoutsMeet' }
              }
            }
          };

          const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
          });

          if (response.data.conferenceData?.entryPoints?.length) {
            const entryPoint = response.data.conferenceData.entryPoints.find(ep => ep.entryPointType === 'video');
            finalMeetLink = entryPoint?.uri || response.data.conferenceData.entryPoints[0]?.uri;
            googleEventId = response.data.id;
          }

          if (!finalMeetLink && response.data.hangoutLink) {
            finalMeetLink = response.data.hangoutLink;
            googleEventId = response.data.id;
          }

          if (!finalMeetLink) {
            return res.status(500).json({ success: false, message: 'Google Meet could not be created. Check your Google API credentials.' });
          }
        } catch (googleError) {
          console.error('Failed to create Google Meet link:', googleError);
          return res.status(500).json({ success: false, message: 'Google Meet integration failed. Provide a valid meet link or configure a Google API refresh token.' });
        }
      } else {
        return res.status(400).json({ success: false, message: 'Google Meet requires a valid Meet URL or server-side Google integration.' });
      }
    } else if (chosenPlatform === 'zoom') {
      if (meetLink && meetLink.trim()) {
        const candidate = meetLink.trim();
        if (!isValidZoomUrl(candidate)) {
          return res.status(400).json({ success: false, message: 'Please provide a valid Zoom meeting URL.' });
        }
        finalMeetLink = candidate;
      } else {
        finalMeetLink = `https://zoom.us/j/${Math.floor(100000000 + Math.random() * 900000000)}`;
      }
    } else {
      // EDOT Live Studio (LiveKit)
      finalMeetLink = null;
    }

    const liveClass = await prisma.liveClass.create({
      data: {
        courseId,
        sectionId: validatedSectionId,
        instructorId,
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        durationMinutes,
        meetLink: finalMeetLink,
        googleEventId,
        platform: chosenPlatform
      },
      include: {
        instructor: {
          select: { id: true, name: true, avatar: true, email: true }
        },
        course: {
          select: {
            id: true,
            title: true,
            instructorId: true,
            instructor: { select: { id: true, name: true, email: true, avatar: true } }
          }
        }
      }
    });

    await notifyCourseStudents(req, liveClass, 'scheduled');

    res.status(201).json({ success: true, liveClass });
  } catch (error) {
    console.error('Error creating live class:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const joinLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const liveClass = await prisma.liveClass.findUnique({
      where: { id }
    });

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    // Record attendance
    await prisma.liveClassAttendance.upsert({
      where: {
        liveClassId_studentId: {
          liveClassId: id,
          studentId
        }
      },
      update: {}, // Already joined, do nothing
      create: {
        liveClassId: id,
        studentId
      }
    });

    // Update status to live if it was scheduled
    if (liveClass.status === 'scheduled' && req.user.role === 'instructor') {
      await prisma.liveClass.update({
        where: { id },
        data: { status: 'live' }
      });
      if (req.io) req.io.emit('live_class_started', { classId: id, courseId: liveClass.courseId });
      await notifyCourseStudents(req, liveClass, 'started');
    }

    if (req.user.role === 'student' && liveClass.instructorId) {
      const instructorNotification = {
        userId: liveClass.instructorId,
        type: 'attendance_update',
        title: `Student joined your live class`,
        message: `${req.user.name || 'A student'} joined "${liveClass.title}".`,
        relatedEntityType: 'liveClass',
        relatedEntityId: liveClass.id,
        actionUrl: `/dashboard/live-classes?join=${liveClass.id}`
      };

      try {
        await prisma.notification.create({ data: instructorNotification });
        if (req.io) {
          req.io.to(`user_${liveClass.instructorId}`).emit('notification', {
            title: instructorNotification.title,
            message: instructorNotification.message,
            type: instructorNotification.type,
            actionUrl: instructorNotification.actionUrl,
            relatedEntityType: instructorNotification.relatedEntityType,
            relatedEntityId: instructorNotification.relatedEntityId
          });
        }
      } catch (notifError) {
        console.error('Failed to notify instructor of student join:', notifError);
      }
    }

    if (req.io) req.io.emit('attendance_update', { classId: id, studentId });

    if (liveClass.platform === 'google_meet' || liveClass.platform === 'zoom') {
      if (!liveClass.meetLink) {
        return res.status(500).json({ success: false, message: 'Meeting link is not available for this session.' });
      }
      return res.json({ 
        success: true, 
        meetLink: liveClass.meetLink 
      });
    }

    // Generate LiveKit Token
    const roomName = `edot-class-${id}`;
    let participantName = req.user.name || `User-${studentId.substring(0, 5)}`;

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY || 'devkey',
      process.env.LIVEKIT_API_SECRET || 'secret'
    );

    const isRoomAdmin = req.user.role === 'instructor' || req.user.role === 'admin';

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: isRoomAdmin,
    });
    at.identity = studentId;
    at.name = participantName;

    const token = await at.toJwt();

    res.json({ 
      success: true, 
      token, 
      roomName, 
      livekitUrl: process.env.LIVEKIT_URL || 'ws://localhost:7880',
      meetLink: liveClass.meetLink // Fallback for existing UI
    });
  } catch (error) {
    console.error('Error joining live class:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markClassCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    const liveClass = await prisma.liveClass.findUnique({
      where: { id }
    });

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    if (liveClass.instructorId !== instructorId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to end this class' });
    }

    const updated = await prisma.liveClass.update({
      where: { id },
      data: { status: 'completed' }
    });

    if (req.io) req.io.emit('live_class_ended', { classId: id, courseId: liveClass.courseId });
    await notifyCourseStudents(req, liveClass, 'ended');

    res.json({ success: true, liveClass: updated });
  } catch (error) {
    console.error('Error completing live class:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getClassAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const attendances = await prisma.liveClassAttendance.findMany({
      where: { liveClassId: id },
      include: {
        student: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });

    res.json({ success: true, attendances });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const uploadRecording = async (req, res) => {
  try {
    const { courseId, liveClassId, title, description, videoUrl, thumbnail, duration, isPublic, requiresPermission } = req.body;
    const instructorId = req.user.id;

    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to upload recordings' });
    }

    const recording = await prisma.recordedClass.create({
      data: {
        courseId,
        liveClassId,
        instructorId,
        title,
        description,
        videoUrl,
        thumbnail: thumbnail || 'default-video-thumb.jpg',
        duration: duration ? parseInt(duration) : 0,
        isPublic: isPublic !== undefined ? isPublic : false,
        requiresPermission: requiresPermission !== undefined ? requiresPermission : true
      },
      include: {
        course: { select: { title: true } },
        instructor: { select: { name: true } }
      }
    });

    res.status(201).json({ success: true, recording });
  } catch (error) {
    console.error('Error uploading recording:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRecordings = async (req, res) => {
  try {
    const { courseId } = req.query;
    const userId = req.user.id;
    const role = req.user.role;

    let whereClause = {};
    if (courseId) whereClause.courseId = courseId;

    const recordings = await prisma.recordedClass.findMany({
      where: whereClause,
      include: {
        course: { select: { title: true } },
        instructor: { select: { name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter based on permissions
    let allowedRecordings = [];
    if (role === 'admin' || role === 'instructor') {
      allowedRecordings = recordings;
    } else {
      for (const rec of recordings) {
        if (rec.isPublic) {
          allowedRecordings.push(rec);
          continue;
        }
        if (rec.requiresPermission) {
          // Check enrollment
          const isEnrolled = await prisma.enrollment.findFirst({
            where: { studentId: userId, courseId: rec.courseId, status: 'approved' }
          });
          if (isEnrolled) {
            allowedRecordings.push(rec);
          }
        } else {
          allowedRecordings.push(rec);
        }
      }
    }

    res.json({ success: true, recordings: allowedRecordings });
  } catch (error) {
    console.error('Error fetching recordings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getSignedPlaybackUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const rec = await prisma.recordedClass.findUnique({
      where: { id }
    });

    if (!rec) return res.status(404).json({ success: false, message: 'Recording not found' });

    // Permission check
    let allowed = false;
    if (role === 'admin' || role === 'instructor' || rec.isPublic) {
      allowed = true;
    } else if (rec.requiresPermission) {
      const isEnrolled = await prisma.enrollment.findFirst({
        where: { studentId: userId, courseId: rec.courseId, status: 'approved' }
      });
      if (isEnrolled) allowed = true;
    } else {
      allowed = true;
    }

    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You do not have permission to view this recording.' });
    }

    // Update Watch History
    await prisma.watchHistory.upsert({
      where: {
        recordedClassId_studentId: { recordedClassId: id, studentId: userId }
      },
      update: { lastWatchedAt: new Date() },
      create: { recordedClassId: id, studentId: userId }
    });

    // Generate Signed URL
    const matches = rec.videoUrl.match(/\/v\d+\/(.+?)(?:\.\w+)?$/);
    const publicId = matches ? matches[1] : null;

    let signedUrl = rec.videoUrl;
    if (publicId && process.env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      signedUrl = cloudinary.url(publicId, {
        resource_type: 'video',
        type: 'authenticated',
        sign_url: true,
        expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour valid
      });
    }

    res.json({ success: true, playUrl: signedUrl });
  } catch (error) {
    console.error('Error generating playback URL:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

