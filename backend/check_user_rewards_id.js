require('dotenv').config();
const db = require('./config/db');

async function check() {
    try {
        const [rows] = await db.query("SHOW COLUMNS FROM user_rewards LIKE 'id'");
        console.log(rows[0]);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
