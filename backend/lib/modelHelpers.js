import bcrypt from 'bcryptjs';

/**
 * User Model Helpers
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (candidatePassword, hash) => {
  return await bcrypt.compare(candidatePassword, hash);
};

/**
 * Course Model Helpers
 */
export const generateCourseSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export const getCourseTotalLessons = (course) => {
  if (!course || !course.lessons) return 0;
  return course.lessons.length;
};

export const getCourseFormattedDuration = (hours) => {
  if (hours < 1) return `${Math.round(hours * 60)} minutes`;
  if (hours === 1) return '1 hour';
  return `${hours} hours`;
};

/**
 * Lesson Model Helpers
 */
export const getLessonFormattedDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return remainingMinutes > 0 
    ? `${hours} hr ${remainingMinutes} min` 
    : `${hours} hr`;
};

/**
 * Achievement Model Helpers
 */
export const calculateAchievementRank = (learningPoints) => {
  if (learningPoints >= 1000) return 'Master Scholar';
  if (learningPoints >= 500) return 'Advanced Learner';
  if (learningPoints >= 250) return 'Dedicated Student';
  if (learningPoints >= 100) return 'Rising Star';
  return 'Novice';
};

/**
 * Attendance Model Helpers
 */
export const normalizeAttendanceDate = (date) => {
  if (!date) return date;
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};
