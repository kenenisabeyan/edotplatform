import { prisma } from './lib/prisma.js';
import bcrypt from 'bcryptjs';

async function check() {
    const user = await prisma.user.findUnique({ where: { email: 'kenenisa@gmail.com' } });
    console.log("User:", user?.email, "Role:", user?.role);
    if (user) {
        const hash = await bcrypt.hash('password123', 10);
        await prisma.user.update({
            where: { email: 'kenenisa@gmail.com' },
            data: { password: hash }
        });
        console.log("Password updated to 'password123'.");
    } else {
        console.log("User not found.");
    }
}
check().finally(() => prisma.$disconnect());
