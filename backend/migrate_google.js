require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    try {
        console.log("Adding google_id column...");
        await db.query(`ALTER TABLE users_new ADD COLUMN google_id VARCHAR(255) NULL UNIQUE AFTER email`);
        await db.query(`ALTER TABLE users_new ADD INDEX idx_google_id (google_id)`);
        console.log("Migration successful!");
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
             console.log("Column google_id already exists.");
             process.exit(0);
        }
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
