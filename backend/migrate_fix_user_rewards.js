require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    try {
        console.log("🚀 Starting Fix User Rewards Schema (Source ENUM)...");
        const connection = await db.getConnection();

        // Update 'source' ENUM to include 'shop'
        console.log("Updating source ENUM...");
        try {
            await connection.query(`
                ALTER TABLE user_rewards 
                MODIFY COLUMN source ENUM('task','level','event','admin','shop') DEFAULT 'admin'
            `);
            console.log("✅ Column 'source' updated successfully.");
        } catch (err) {
            throw err;
        }

        console.log("🏁 Migration Fix User Rewards Complete.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration Failed:", err);
        process.exit(1);
    }
}

migrate();
