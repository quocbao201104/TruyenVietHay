const db = require("./config/db");
require("dotenv").config();
const Task = require("./models/userTask.model");
const UserLevelsHistory = require("./models/userLevelHistory.model");
const taskService = require("./services/task.service");

async function debug() {
  try {
    // 1. Get a user ID (dummy or first user)
    const [users] = await db.execute("SELECT id, username FROM users LIMIT 1");
    if (users.length === 0) {
        console.log("No users found.");
        return;
    }
    const userId = users[0].id;
    console.log(`Checking for User ID: ${userId} (${users[0].username})`);

    // 2. Check current level
    const currentLevelId = await UserLevelsHistory.getCurrentLevelOfUser(userId);
    console.log(`Current Level ID from Service: ${currentLevelId}`);

    // 3. raw check level history
    const [history] = await db.execute("SELECT * FROM user_levels_history WHERE user_id = ?", [userId]);
    console.log("Raw History:", history);

    // 4. Check tasks for level 1 (or current)
    const targetLevel = currentLevelId || 1;
    const [tasks] = await db.execute("SELECT * FROM tasks WHERE level_id = ?", [targetLevel]);
    console.log(`Tasks for Level ${targetLevel}:`, tasks.length);
    if(tasks.length > 0) console.log(tasks[0]);

    // 5. Run service method
    console.log("Running taskService.getAllTasks...");
    try {
        const result = await taskService.getAllTasks(userId);
        console.log("Service Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Service Error:", e.message);
    }

  } catch (err) {
    console.error("Debug Error:", err);
  } finally {
    process.exit();
  }
}

debug();
