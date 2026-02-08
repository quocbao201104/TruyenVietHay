require('dotenv').config();
const db = require('./config/db');

async function check() {
    try {
        const [rows] = await db.query("SHOW COLUMNS FROM rewards LIKE 'is_repeatable'");
        console.log(rows[0]);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
