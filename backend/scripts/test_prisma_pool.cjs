const pg = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  console.log("Connection string from env:", connectionString);
  
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  try {
    const coursesCount = await prisma.course.count();
    console.log("SUCCESS! Connected to Prisma with pg Pool. Course count:", coursesCount);
  } catch (err) {
    console.error("FAIL! Prisma query error:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
