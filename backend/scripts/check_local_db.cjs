const { PrismaClient } = require('@prisma/client');

async function main() {
    console.log("Connecting to localhost:5432...");
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: "postgresql://postgres:password@localhost:5432/edot?schema=public" // Common local URL
            }
        }
    });

    try {
        const userCount = await prisma.user.count();
        const courseCount = await prisma.course.count();
        console.log(`Local DB has ${userCount} users and ${courseCount} courses.`);
        
        const courses = await prisma.course.findMany({ select: { title: true }, take: 3 });
        console.log("Sample courses:", courses);
    } catch (e) {
        console.error("Could not connect to local DB:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
