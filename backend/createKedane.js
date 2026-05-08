import { prisma } from './lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
    const password = await bcrypt.hash('password', 10);
    
    const existing = await prisma.user.findFirst({ where: { email: 'kedane@gmail.com' } });
    if (!existing) {
        await prisma.user.create({
            data: {
                name: 'Kedane',
                email: 'kedane@gmail.com',
                password,
                role: 'student',
                status: 'approved'
            }
        });
        console.log(`Created user: kedane@gmail.com`);
    } else {
        console.log(`User already exists: kedane@gmail.com`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
