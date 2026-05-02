const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_N17vCbPGcAzs@ep-rapid-credit-a4esckh0-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require' }); 
client.connect()
  .then(() => client.query(`SELECT title, "videoUrl" FROM "Lesson" WHERE title LIKE '%kenenisa%' LIMIT 5`))
  .then(res => { console.log(res.rows); client.end(); })
  .catch(err => console.error(err));
