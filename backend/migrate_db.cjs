const { Client } = require('pg');

async function main() {
    console.log("Connecting to local database...");
    const localClient = new Client({
        connectionString: "postgresql://postgres:password@localhost:5432/edot?schema=public"
    });

    try {
        await localClient.connect();
        const res = await localClient.query('SELECT count(*) FROM "Course"');
        console.log(`Local DB has ${res.rows[0].count} courses.`);
        
        const courses = await localClient.query('SELECT title FROM "Course" LIMIT 3');
        console.log("Sample courses:", courses.rows);
    } catch (e) {
        console.error("Could not connect to local DB:", e.message);
    } finally {
        await localClient.end();
    }
}

main();
