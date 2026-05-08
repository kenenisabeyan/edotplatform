import { prisma } from './lib/prisma.js';

async function main() {
    const progress = await prisma.userCourseProgress.findMany();
    const seen = new Set();
    const duplicates = [];
    
    for (const p of progress) {
        const key = `${p.userId}-${p.courseId}`;
        if (seen.has(key)) {
            duplicates.push(p);
        } else {
            seen.add(key);
        }
    }
    
    if (duplicates.length > 0) {
        console.log(`Found ${duplicates.length} duplicates. Deleting them...`);
        for (const p of duplicates) {
            await prisma.userCourseProgress.delete({ where: { id: p.id } });
        }
        console.log('Duplicates deleted.');
    } else {
        console.log('No duplicates found.');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
