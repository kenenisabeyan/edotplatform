import { prisma } from './lib/prisma.js';

async function run() {
  // Check for admin user
  let user = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!user) {
    user = await prisma.user.findFirst({ where: { role: 'instructor' } });
  }
  
  if (!user) {
    console.log("No user found to be instructor");
    return;
  }

  const course = await prisma.course.create({
    data: {
      title: 'Advanced Web Development & WebRTC',
      description: 'Master modern real-time streaming, WebRTC, LiveKit, and React.',
      slug: 'advanced-web-dev-webrtc-' + Date.now(),
      instructorId: user.id,
      mainCategory: 'Technology',
      subCategory: 'Web Development',
      level: 'Advanced',
      status: 'approved',
      isPublished: true,
      price: 0,
      duration: 10,
    }
  });

  console.log("Created course:", course.title);
}

run().catch(console.error).finally(() => prisma.$disconnect());
