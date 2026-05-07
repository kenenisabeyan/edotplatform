const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedCertificates() {
    try {
        console.log("Seeding certificates for users based on their enrollments...");
        
        // Find all students
        const students = await prisma.user.findMany({
            where: { role: 'student' }
        });

        let addedCount = 0;

        for (const student of students) {
            // Find enrollments for this student
            const enrollments = await prisma.enrollment.findMany({
                where: { studentId: student.id },
                include: { course: true }
            });

            for (const enrollment of enrollments) {
                // Check if certificate already exists
                const existingCert = await prisma.certificate.findFirst({
                    where: { userId: student.id, courseId: enrollment.courseId }
                });

                if (!existingCert) {
                    await prisma.certificate.create({
                        data: {
                            userId: student.id,
                            courseId: enrollment.courseId,
                            issueDate: new Date(),
                            certificateUrl: 'https://edot.org/verify/sample',
                        }
                    });
                    
                    // Also create a progress entry at 100% so everything matches perfectly
                    const existingProgress = await prisma.userCourseProgress.findFirst({
                        where: { userId: student.id, courseId: enrollment.courseId }
                    });
                    
                    if (!existingProgress) {
                        await prisma.userCourseProgress.create({
                            data: {
                                userId: student.id,
                                courseId: enrollment.courseId,
                                progress: 100,
                                status: 'completed'
                            }
                        });
                    } else {
                        await prisma.userCourseProgress.update({
                            where: { id: existingProgress.id },
                            data: {
                                progress: 100,
                                status: 'completed'
                            }
                        });
                    }

                    addedCount++;
                    console.log(`Added certificate for ${student.name} - Course: ${enrollment.course.title}`);
                }
            }
        }

        console.log(`Successfully added ${addedCount} missing certificates!`);
    } catch (error) {
        console.error("Error seeding certificates:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedCertificates();
