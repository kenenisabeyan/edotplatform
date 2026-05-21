import { prisma } from './lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'superadmin@edot.com' },
    update: { password: hash, role: 'admin', status: 'approved' },
    create: { email: 'superadmin@edot.com', name: 'Super Admin', password: hash, role: 'admin', status: 'approved' }
  });
  console.log('Created/Updated superadmin@edot.com with password: admin123');
}

main().finally(() => prisma.$disconnect());
