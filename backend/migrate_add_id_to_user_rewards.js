require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    try {
        console.log("🚀 Starting Add ID to User Rewards Migration...");
        const connection = await db.getConnection();

        // Add 'id' column if missing
        console.log("Checking id column...");
        try {
            const [cols] = await connection.query("SHOW COLUMNS FROM user_rewards LIKE 'id'");
            if (cols.length === 0) {
                console.log("Adding column 'id' (AUTO_INCREMENT PRIMARY KEY)...");
                // Note: IF there is an existing PK, this might fail unless we drop it.
                // Assuming (user_id, reward_id) might be PK?
                // Let's check keys first?
                // But for now, let's try adding ID.
                await connection.query(`
                    ALTER TABLE user_rewards 
                    ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST
                `);
                console.log("✅ Column 'id' added successfully.");
            } else {
                 console.log("Column 'id' already exists.");
            }
        } catch (err) {
            // If failure due to multiple primary keys
            if (err.code === 'ER_MULTIPLE_PRI_KEY') {
                console.log("⚠️ Table already has a Primary Key. Dropping existing PK and adding ID...");
                await connection.query(`ALTER TABLE user_rewards DROP PRIMARY KEY`);
                await connection.query(`
                    ALTER TABLE user_rewards 
                    ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST
                `);
                console.log("✅ Column 'id' added (replaced old PK).");
            } else {
                throw err;
            }
        }

        console.log("🏁 Migration Add ID Complete.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration Failed:", err);
        process.exit(1);
    }
}

migrate();
