import { prisma } from './lib/prisma.js';

async function main() {
  const lessons = await prisma.lesson.findMany({
    select: { title: true, videoUrl: true }
  });
  console.log("LESSON URLS:");
  console.log(JSON.stringify(lessons, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
