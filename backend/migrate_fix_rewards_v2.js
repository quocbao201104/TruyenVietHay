require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    try {
        console.log("🚀 Starting Fix Rewards Schema V2...");
        const connection = await db.getConnection();

        // Add 'is_active'
        console.log("Checking is_active...");
        const [activeCols] = await connection.query("SHOW COLUMNS FROM rewards LIKE 'is_active'");
        if (activeCols.length === 0) {
            console.log("Adding column 'is_active'...");
            await connection.query(`
                ALTER TABLE rewards 
                ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER is_repeatable
            `);
        } else {
             console.log("Column 'is_active' exists.");
        }

        // Add 'display_order'
        console.log("Checking display_order...");
        const [orderCols] = await connection.query("SHOW COLUMNS FROM rewards LIKE 'display_order'");
        if (orderCols.length === 0) {
            console.log("Adding column 'display_order'...");
            await connection.query(`
                ALTER TABLE rewards 
                ADD COLUMN display_order INT DEFAULT 0 AFTER is_active
            `);
        } else {
             console.log("Column 'display_order' exists.");
        }

        console.log("🏁 Migration V2 Complete.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration Failed:", err);
        process.exit(1);
    }
}

migrate();
