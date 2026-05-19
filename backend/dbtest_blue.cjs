const { Client } = require('pg');

async function testDB(url, name) {
    const client = new Client({ connectionString: url });
    try {
        await client.connect();
        const res = await client.query('SELECT count(*) FROM "Course"');
        console.log(`[${name}] Courses: ${res.rows[0].count}`);
    } catch (e) {
        console.log(`[${name}] Error - ${e.message}`);
    } finally {
        await client.end();
    }
}

async function main() {
    console.log("Checking databases...");
    const urlNeonOld = 'postgresql://neondb_owner:npg_N17vCbPGcAzs@ep-rapid-credit-a4esckh0-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
    const urlNeonNew = 'postgresql://neondb_owner:npg_7L3BdmUGNvsK@ep-blue-morning-appqoiny-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

    await testDB(urlNeonOld, "NEON OLD (rapid-credit)");
    await testDB(urlNeonNew, "NEON NEW (blue-morning)");
}

main();
