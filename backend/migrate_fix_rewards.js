require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    try {
        console.log("🚀 Starting Fix Rewards Schema Migration...");
        const connection = await db.getConnection();

        // Add 'code' column to rewards
        console.log("Adding column 'code' to rewards...");
        try {
            const [cols] = await connection.query("SHOW COLUMNS FROM rewards LIKE 'code'");
            if (cols.length === 0) {
                await connection.query(`
                    ALTER TABLE rewards 
                    ADD COLUMN code VARCHAR(50) NULL AFTER price
                `);
                console.log("✅ Column 'code' added successfully.");
            } else {
                console.log("⚠️ Column 'code' already exists.");
            }
        } catch (err) {
            throw err;
        }

        console.log("🏁 Migration Complete.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration Failed:", err);
        process.exit(1);
    }
}

migrate();
