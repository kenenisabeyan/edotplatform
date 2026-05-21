import { prisma } from './lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
    const newPassword = 'password123';
    const hash = await bcrypt.hash(newPassword, 10);

    // Update literally every active user account to have the exact same password
    const emailsToUpdate = [
        'kedane@gmail.com', 
        'keno@gmail.com', 
        'keno@gmial.com', 
        'student@test.com',
        'test500@example.com',
        'instructor@test.com',
        'admin@test.com'
    ];

    for (const email of emailsToUpdate) {
        await prisma.user.updateMany({
            where: { email },
            data: { password: hash }
        });
        console.log(`Updated password for ${email} to: ${newPassword}`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
