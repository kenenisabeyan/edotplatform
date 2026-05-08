import { prisma } from './lib/prisma.js';
async function main() {
    const user = await prisma.user.findFirst({ where: { email: 'kedane@gmail.com' } });
    console.log("User:", user);
}
main().catch(console.error).finally(() => prisma.$disconnect());
