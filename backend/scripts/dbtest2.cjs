const { PrismaClient } = require('@prisma/client');

async function testDB(url, name) {
    // Avoid Prisma Constructor Validation Error by setting env var
    process.env.DATABASE_URL = url;
    const prisma = new PrismaClient();
    try {
        const userCount = await prisma.user.count();
        const courseCount = await prisma.course.count();
        console.log(`[${name}] Users: ${userCount}, Courses: ${courseCount}`);
    } catch (e) {
        console.log(`[${name}] Error - ${e.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    console.log("Checking databases...");
    
    const urlLocal = 'postgresql://postgres:password@localhost:5432/edot?schema=public'; // assuming default postgres user
    const urlNeonOld = 'postgresql://neondb_owner:npg_N17vCbPGcAzs@ep-rapid-credit-a4esckh0-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
    const urlNeonNew = 'postgresql://neondb_owner:npg_7L3BdmUGNvsK@ep-blue-morning-appqoiny-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

    try { await testDB(urlLocal, "LOCAL"); } catch(e){}
    try { await testDB(urlNeonOld, "NEON OLD"); } catch(e){}
    try { await testDB(urlNeonNew, "NEON NEW"); } catch(e){}
}

main();
