import { prisma } from './lib/prisma.js';

async function main() {
    const users = await prisma.user.findMany({
        select: { email: true, createdAt: true }
    });
    console.log("All users:", users.map(u => u.email));
}

main().catch(console.error).finally(() => prisma.$disconnect());
