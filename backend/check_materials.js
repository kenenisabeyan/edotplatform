import { prisma } from './lib/prisma.js';

async function main() {
  const lesson = await prisma.lesson.findFirst({
    where: { title: "who is kenenisa?" },
    include: { materials: true }
  });
  console.log("LESSON MATERIALS:");
  console.log(JSON.stringify(lesson.materials, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
