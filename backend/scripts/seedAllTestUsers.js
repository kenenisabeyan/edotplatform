import { prisma } from './lib/prisma.js';

async function main() {
    const courses = await prisma.course.findMany({ select: { id: true } });
    if (courses.length === 0) {
        console.log("No courses found!");
        return;
    }

    const testEmails = ['kedane@gmail.com', 'keno@gmail.com', 'student@test.com', 'test500@example.com'];
    
    for (const email of testEmails) {
        const user = await prisma.user.findFirst({ where: { email } });
        if (!user) continue;

        console.log(`Processing user ${email}...`);

        for (const course of courses) {
            // Create Enrollment
            await prisma.enrollment.upsert({
                where: { studentId_courseId: { studentId: user.id, courseId: course.id } },
                update: {},
                create: {
                    studentId: user.id,
                    courseId: course.id,
                    status: 'active'
                }
            });

            // Create UserCourseProgress
            const existingProgress = await prisma.userCourseProgress.findFirst({
                where: { userId: user.id, courseId: course.id }
            });
            if (existingProgress) {
                await prisma.userCourseProgress.update({
                    where: { id: existingProgress.id },
                    data: { progress: 100, completed: true, status: 'completed' }
                });
            } else {
                await prisma.userCourseProgress.create({
                    data: {
                        userId: user.id,
                        courseId: course.id,
                        progress: 100,
                        completed: true,
                        status: 'completed'
                    }
                });
            }

            // Create Certificate
            const crypto = await import('crypto');
            const verificationHash = crypto.createHash('sha256').update(`${user.id}-${course.id}`).digest('hex');

            await prisma.certificate.upsert({
                where: { verificationHash },
                update: {},
                create: {
                    userId: user.id,
                    courseId: course.id,
                    verificationHash,
                    isSeen: false,
                    issued: true
                }
            });
        }
        
        // Ensure UserSetting exists
        await prisma.userSetting.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id, weeklyStudyGoal: 15 }
        });
        
        // Ensure Achievement exists
        await prisma.achievement.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id, learningPoints: 500, rank: 'Scholar' }
        });

        console.log(`Successfully seeded data for ${email}`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
