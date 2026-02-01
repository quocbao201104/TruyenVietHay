require("dotenv").config();
const db = require("./config/db");
const taskService = require("./services/task.service");

async function test() {
  try {
    console.log("🛠 TEST: Daily Task Auto-Provisioning");

    // 1. Get a user
    const [users] = await db.execute("SELECT id FROM users_new LIMIT 1");
    if (users.length === 0) {
        console.log("❌ No users found to test.");
        return;
    }
    const userId = users[0].id;
    console.log(`👤 Testing with User ID: ${userId}`);

    // 2. Clear tasks for today for this user (to ensure test starts fresh)
    await db.execute("DELETE FROM user_tasks WHERE user_id = ? AND DATE(assigned_at) = CURDATE()", [userId]);
    console.log("🧹 Cleared today's task records for user.");

    // 3. Check before (should be 0)
    const [before] = await db.execute("SELECT count(*) as count FROM user_tasks WHERE user_id = ? AND DATE(assigned_at) = CURDATE()", [userId]);
    console.log(`📊 Tasks for today BEFORE: ${before[0].count}`);

    // 4. Call Service with logging inside (or via console.log here if I modify service)
    // Actually, let's just check the level here manually first to understand why service fails
    const UserLevelsHistory = require("./models/userLevelHistory.model");
    let level = await UserLevelsHistory.getCurrentLevelOfUser(userId);
    console.log(`🔍 User Level: ${level || 'None (Defaults to 1)'}`);

    const [tasksInDb] = await db.execute("SELECT * FROM tasks WHERE level_id = ?", [level || 1]);
    console.log(`🔍 Tasks defined in DB for Level ${level || 1}: ${tasksInDb.length}`);
    if (tasksInDb.length > 0) {
        console.log(`   Sample Task: ${tasksInDb[0].task_name} (ID: ${tasksInDb[0].task_id})`);
    }

    console.log("🚀 Calling taskService.getAllTasks(userId)...");
    const tasks = await taskService.getAllTasks(userId);
    console.log(`✅ Service returned ${tasks.length} tasks.`);

    // 5. Check after (should be > 0)
    const [after] = await db.execute("SELECT count(*) as count FROM user_tasks WHERE user_id = ? AND DATE(assigned_at) = CURDATE()", [userId]);
    console.log(`📊 Tasks for today AFTER: ${after[0].count}`);

    if (after[0].count > 0) {
        console.log("✅ SUCCESS: Tasks were auto-provisioned!");
    } else {
        console.log("❌ FAILED: No tasks were created.");
    }

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    process.exit();
  }
}

test();
