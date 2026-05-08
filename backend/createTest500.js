import { prisma } from './lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
    const password = await bcrypt.hash('12345678', 10);
    
    const email = 'test500@example.com';
    const existing = await prisma.user.findFirst({ where: { email } });
    
    if (!existing) {
        await prisma.user.create({
            data: {
                name: 'Test 500 User',
                email: email,
                password,
                role: 'student',
                status: 'approved'
            }
        });
        console.log(`Created user: ${email}`);
    } else {
        await prisma.user.updateMany({
            where: { email },
            data: { password }
        });
        console.log(`Updated user password: ${email}`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
