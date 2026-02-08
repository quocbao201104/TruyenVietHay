require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    try {
        console.log("🚀 Starting Phase 2 Migration...");
        const connection = await db.getConnection();

        // 1. Add Index to user_tasks
        console.log("Adding index idx_user_task_date to user_tasks...");
        try {
            await connection.query(`
                CREATE INDEX idx_user_task_date 
                ON user_tasks (user_id, task_id, assigned_at)
            `);
            console.log("✅ Index added successfully.");
        } catch (err) {
            if (err.code === 'ER_DUP_KEYNAME') {
                console.log("⚠️ Index already exists, skipping.");
            } else {
                throw err;
            }
        }

        console.log("🏁 Migration Complete.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration Failed:", err);
        process.exit(1);
    }
}

migrate();
