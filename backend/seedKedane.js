import { prisma } from './lib/prisma.js';
import crypto from 'crypto';

async function main() {
    const student = await prisma.user.findFirst({ where: { email: 'kedane@gmail.com' } });
    if (!student) return;

    const courses = await prisma.course.findMany({ take: 3 });
    for (const course of courses) {
        // Enroll
        const existingEnrollment = await prisma.enrollment.findFirst({
            where: { studentId: student.id, courseId: course.id }
        });
        
        if (!existingEnrollment) {
            await prisma.enrollment.create({
                data: { studentId: student.id, courseId: course.id, status: 'active' }
            });
            
            // Add user progress
            await prisma.userCourseProgress.create({
                data: {
                    userId: student.id,
                    courseId: course.id,
                    progress: 100,
                    status: 'completed',
                    passedFinalExam: true
                }
            });

            const hash = crypto.createHash('sha256').update(`${student.id}-${course.id}`).digest('hex');

            // Issue Certificate
            await prisma.certificate.create({
                data: {
                    userId: student.id,
                    courseId: course.id,
                    issueDate: new Date(),
                    certificateUrl: 'https://edot.org/verify/sample',
                    verificationHash: hash
                }
            });
        }
    }
    console.log(`Seeded kedane@gmail.com with ${courses.length} courses and certificates.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
