import { prisma } from './lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
    const password = await bcrypt.hash('password123', 10);
    
    const usersToCreate = [
        { name: 'Kenenisa Beyan', email: 'admin@test.com', role: 'admin', status: 'approved' },
        { name: 'EDOT Instructor', email: 'instructor@test.com', role: 'instructor', status: 'approved' },
        { name: 'EDOT Student', email: 'student@test.com', role: 'student', status: 'approved' },
    ];

    for (const u of usersToCreate) {
        const existing = await prisma.user.findFirst({ where: { email: u.email } });
        if (!existing) {
            await prisma.user.create({
                data: {
                    ...u,
                    password
                }
            });
            console.log(`Created user: ${u.email}`);
        } else {
            console.log(`User already exists: ${u.email}`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
