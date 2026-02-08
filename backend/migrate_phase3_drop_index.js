require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    try {
        console.log("🚀 Starting Phase 3 (Index Drop)...");
        const connection = await db.getConnection();

        // Drop UNIQUE key on user_tasks
        console.log("Dropping index idx_user_task_unique...");
        try {
            await connection.query(`
                ALTER TABLE user_tasks 
                DROP INDEX idx_user_task_unique
            `);
            console.log("✅ Index dropped successfully.");
        } catch (err) {
            if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                console.log("⚠️ Index does not exist, skipping.");
            } else {
                throw err;
            }
        }

        console.log("🏁 Phase 3 Migration Complete.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration Failed:", err);
        process.exit(1);
    }
}

migrate();
