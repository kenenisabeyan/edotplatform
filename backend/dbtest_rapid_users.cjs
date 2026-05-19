const { Client } = require('pg');

async function main() {
    const urlNeonOld = 'postgresql://neondb_owner:npg_N17vCbPGcAzs@ep-rapid-credit-a4esckh0-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
    const client = new Client({ connectionString: urlNeonOld });
    try {
        await client.connect();
        const userRes = await client.query('SELECT count(*), email, role FROM "User" GROUP BY email, role');
        console.log("Users in rapid-credit:");
        console.log(userRes.rows);
    } catch (e) {
        console.log("Error:", e.message);
    } finally {
        await client.end();
    }
}
main();
