import { prisma } from './lib/prisma.js';

async function main() {
    const users = await prisma.user.findMany({
        select: { 
            name: true,
            email: true, 
            role: true,
            status: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    
    console.log("=== EXISTING USERS IN DATABASE ===");
    users.forEach(u => {
        console.log(`- Name: ${u.name || 'N/A'}`);
        console.log(`  Email: ${u.email}`);
        console.log(`  Role: ${u.role}`);
        console.log(`  Status: ${u.status}`);
        console.log('------------------------');
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
