import { prisma } from './lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
    const hash = await bcrypt.hash('password123', 10);
    const email = 'kenenisab05@gmail.com';
    
    await prisma.user.updateMany({
        where: { email },
        data: { password: hash }
    });
    console.log(`Updated password for ${email} to: password123`);
    
    // Also ensure this user has some dashboard data so it looks good when they log in!
    const user = await prisma.user.findFirst({ where: { email } });
    if (user) {
        const course = await prisma.course.findFirst();
        if (course) {
            await prisma.enrollment.upsert({
                where: { studentId_courseId: { studentId: user.id, courseId: course.id } },
                update: {},
                create: { studentId: user.id, courseId: course.id, status: 'active' }
            });
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
