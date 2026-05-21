import { prisma } from './lib/prisma.js';

async function main() {
  const courses = await prisma.course.findMany({
    select: { title: true, mainCategory: true, status: true, isPublished: true }
  });
  console.log(JSON.stringify(courses, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
