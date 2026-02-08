require('dotenv').config();
const db = require('./config/db');

async function checkSchema() {
    try {
        console.log("🔍 Checking Schema for Phase 2...");

        // 1. Check user_tasks indexes
        console.log("\n--- user_tasks Indexes ---");
        const [taskIndexes] = await db.query("SHOW INDEX FROM user_tasks");
        taskIndexes.forEach(idx => {
            console.log(`Index: ${idx.Key_name}, Column: ${idx.Column_name}`);
        });

        // 2. Check rewards columns
        console.log("\n--- rewards Columns ---");
        const [rewardCols] = await db.query("SHOW COLUMNS FROM rewards");
        const rewardFields = rewardCols.map(c => c.Field);
        console.log("Columns:", rewardFields.join(", "));
        console.log("Has 'price':", rewardFields.includes('price'));
        console.log("Has 'min_level':", rewardFields.includes('min_level'));

        // 3. Check user_rewards columns
        console.log("\n--- user_rewards Columns ---");
        const [userRewardCols] = await db.query("SHOW COLUMNS FROM user_rewards");
        const userRewardFields = userRewardCols.map(c => c.Field);
        console.log("Columns:", userRewardFields.join(", "));
        console.log("Has 'created_at':", userRewardFields.includes('created_at'));

        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkSchema();
