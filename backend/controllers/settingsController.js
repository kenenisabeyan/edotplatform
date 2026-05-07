import { prisma } from '../lib/prisma.js';

export const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    let settings = await prisma.userSetting.findUnique({ where: { userId } });
    if (!settings) {
      settings = await prisma.userSetting.create({ data: { userId } });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error fetching settings', error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const role = req.user.role; // 'student', 'parent', 'instructor', 'admin'
    const settingsData = req.body[role];
    const commonData = req.body.common;
    const userId = req.user.id;

    if (!settingsData && !commonData) {
      return res.status(400).json({ success: false, message: 'No valid setting payload provided.' });
    }

    let settings = await prisma.userSetting.findUnique({ where: { userId } });
    if (!settings) {
      settings = await prisma.userSetting.create({ data: { userId } });
    }

    const updatedData = {};


    if (commonData) {
      if (commonData.timezone !== undefined) updatedData.timezone = commonData.timezone;
      if (commonData.notifySystem !== undefined) updatedData.notifySystem = commonData.notifySystem;
      if (commonData.notifyMessages !== undefined) updatedData.notifyMessages = commonData.notifyMessages;
      if (commonData.notifyDigest !== undefined) updatedData.notifyDigest = commonData.notifyDigest;
      if (commonData.weeklyStudyGoal !== undefined) updatedData.weeklyStudyGoal = Number(commonData.weeklyStudyGoal);
    }

    if (settingsData) {
      if (settingsData.weeklyStudyGoal !== undefined) updatedData.weeklyStudyGoal = Number(settingsData.weeklyStudyGoal);
      if (role === 'student') {
        if (settingsData.shareMilestones !== undefined) updatedData.shareMilestones = settingsData.shareMilestones;
        if (settingsData.shareGrades !== undefined) updatedData.shareGrades = settingsData.shareGrades;
        if (settingsData.privateMode !== undefined) updatedData.privateMode = settingsData.privateMode;
      } else if (role === 'parent') {
        if (settingsData.billingMethod !== undefined) updatedData.billingMethod = settingsData.billingMethod;
        if (settingsData.alertGradeBelow !== undefined) updatedData.alertGradeBelow = settingsData.alertGradeBelow;
        if (settingsData.alertAbsenceCount !== undefined) updatedData.alertAbsenceCount = settingsData.alertAbsenceCount;
      } else if (role === 'instructor') {
        if (settingsData.consultationHours !== undefined) updatedData.consultationHours = settingsData.consultationHours;
        if (settingsData.courseVisibility !== undefined) updatedData.courseVisibility = settingsData.courseVisibility;
        if (settingsData.autoTags !== undefined) updatedData.autoTags = settingsData.autoTags;
        if (settingsData.autoGrade !== undefined) updatedData.autoGrade = settingsData.autoGrade;
      } else if (role === 'admin') {
        if (settingsData.primaryColor !== undefined) updatedData.primaryColor = settingsData.primaryColor;
        if (settingsData.feePercentage !== undefined) updatedData.feePercentage = settingsData.feePercentage;
         if (settingsData.autoInterventionTriggers !== undefined) updatedData.autoInterventionTriggers = settingsData.autoInterventionTriggers;
         if (settingsData.apiKey !== undefined) updatedData.apiKey = settingsData.apiKey;
      }
    }
    
    if (Object.keys(updatedData).length > 0) {
      settings = await prisma.userSetting.update({
        where: { userId },
        data: updatedData
      });
    }
    
    const formattedSettings = {
      id: settings.id,
      user: settings.userId,
      common: {
        timezone: settings.timezone,
        notifySystem: settings.notifySystem,
        notifyMessages: settings.notifyMessages,
        notifyDigest: settings.notifyDigest
      },
      student: {
        shareMilestones: settings.shareMilestones,
        shareGrades: settings.shareGrades,
        privateMode: settings.privateMode
      },
      parent: {
        billingMethod: settings.billingMethod,
        alertGradeBelow: settings.alertGradeBelow,
        alertAbsenceCount: settings.alertAbsenceCount
      },
      instructor: {
        consultationHours: settings.consultationHours,
        courseVisibility: settings.courseVisibility,
        autoTags: settings.autoTags,
        autoGrade: settings.autoGrade
      },
      admin: {
         primaryColor: settings.primaryColor,
         feePercentage: settings.feePercentage,
         autoInterventionTriggers: settings.autoInterventionTriggers,
         apiKey: settings.apiKey
      }
    };

    res.status(200).json({ success: true, data: formattedSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error updating settings', error: error.message });
  }
};

