require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    try {
        console.log("🚀 Starting Phase 3 (Rename Column)...");
        const connection = await db.getConnection();

        console.log("Renaming total_points to total_exp in user_points...");
        try {
            // Check if column exists first to avoid error if re-run
            const [cols] = await connection.query("SHOW COLUMNS FROM user_points LIKE 'total_points'");
            if (cols.length > 0) {
                 await connection.query(`
                    ALTER TABLE user_points 
                    CHANGE COLUMN total_points total_exp INT DEFAULT 0 COMMENT 'Experience points for leveling up'
                `);
                console.log("✅ Column renamed successfully.");
            } else {
                console.log("⚠️ Column 'total_points' not found (maybe already renamed). Checking for 'total_exp'...");
                const [colsNew] = await connection.query("SHOW COLUMNS FROM user_points LIKE 'total_exp'");
                if (colsNew.length > 0) {
                    console.log("✅ Column 'total_exp' already exists.");
                } else {
                    console.error("❌ Neither column exists!");
                }
            }
        } catch (err) {
            throw err;
        }

        console.log("🏁 Phase 3 Rename Complete.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration Failed:", err);
        process.exit(1);
    }
}

migrate();
