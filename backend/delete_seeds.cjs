
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slugs = [
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
  ];

  for (const slug of slugs) {
    const course = await prisma.course.findUnique({ where: { slug } });
    if (course) {
      await prisma.lesson.deleteMany({ where: { courseId: course.id } });
      await prisma.userCourseProgress.deleteMany({ where: { courseId: course.id } });
      await prisma.courseReport.deleteMany({ where: { courseId: course.id } });
      await prisma.course.delete({ where: { id: course.id } });
      console.log('Deleted course:', slug);
    }
  }
  console.log('Finished deleting seed courses.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

