const { PrismaClient } = require('@prisma/client');

async function testDB(url, name) {
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
        const count = await prisma.course.count();
        console.log(`${name}: ${count} courses`);
    } catch (e) {
        console.log(`${name}: Error - ${e.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    const oldUrl = 'postgresql://neondb_owner:npg_N17vCbPGcAzs@ep-rapid-credit-a4esckh0-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
    const newUrl = 'postgresql://neondb_owner:npg_7L3BdmUGNvsK@ep-blue-morning-appqoiny-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
    
    await testDB(oldUrl, "OLD DB (ep-rapid-credit)");
    await testDB(newUrl, "NEW DB (ep-blue-morning)");
}

main();
