import { prisma } from './lib/prisma.js';

async function main() {
  const admins = await prisma.user.findMany({ where: { role: 'admin' } });
  console.log(JSON.stringify(admins.map(a => ({ email: a.email, name: a.name })), null, 2));
}

main().finally(() => prisma.$disconnect());
