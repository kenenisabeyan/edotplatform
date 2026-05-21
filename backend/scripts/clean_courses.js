import { prisma } from './lib/prisma.js';

async function clean() {
  console.log('Deleting seeded courses...');
  const courses = await prisma.course.findMany({
    where: {
      slug: {
        in: [
          'complete-javascript-course-2024',
          'machine-learning-a-z',
          'complete-python-bootcamp',
          'ultimate-drawing-course',
          'mba-in-a-box',
          'data-structures-algorithms-c-cpp',
          'toefl-ibt-complete-preparation',
          'psychology-human-behavior',
          'calculus-1-ultimate',
          'complete-digital-marketing'
        ]
      }
    }
  });

  for (const course of courses) {
    // Delete related records first
    await prisma.lesson.deleteMany({ where: { courseId: course.id } });
    await prisma.enrollment.deleteMany({ where: { courseId: course.id } });
    await prisma.progressLog.deleteMany({ where: { courseId: course.id } });
    await prisma.userCourseProgress.deleteMany({ where: { courseId: course.id } });
    
    // Find course reports to delete records
    const reports = await prisma.courseReport.findMany({ where: { courseId: course.id } });
    for (const report of reports) {
      await prisma.courseReportRecord.deleteMany({ where: { courseReportId: report.id } });
    }
    await prisma.courseReport.deleteMany({ where: { courseId: course.id } });
    
    // Delete course
    await prisma.course.delete({ where: { id: course.id } });
    console.log('Deleted course:', course.title);
  }
  console.log('Cleanup complete.');
}

clean()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
