// services/task.service.js
const Task = require("../models/userTask.model");
const UserLevelsHistory = require("../models/userLevelHistory.model");
const pointService = require("./userPoint.service");
const UserLevel = require("../models/userLevels.model"); // Needed to verify level existence if default logic fails, but history is source of truth

const getAllTasks = async (userId) => {
  const db = require("../config/db");
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get current level of user (Ensure exists)
    // We use the service method to auto-create if missing based on role
    const levelHistoryService = require("./userLevelHistory.service");
    let currentLevelId = await levelHistoryService.ensureUserLevel(userId); 

    // 2. Fetch all generic tasks for this level
    // We need connection here to be safe if we were doing more, but Task.getAllTasksByLevel uses pool.
    // Let's execute raw SQL here for transaction safety or use the service logic refactored?
    // Be safer to use direct query inside transaction for the "Provisioning" step
    
    // Fetch Task Definitions
    const [taskDefs] = await connection.execute(
        "SELECT * FROM tasks WHERE level_id = ?",
        [currentLevelId]
    );

    // 3. For each task, check if exists for TODAY
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    for (const task of taskDefs) {
        // Check if user_task row exists for today
        // Note: assigned_at is DATETIME. We compare date part.
        const [existing] = await connection.execute(
            "SELECT id FROM user_tasks WHERE user_id = ? AND task_id = ? AND DATE(assigned_at) = ?",
            [userId, task.task_id, today]
        );

        if (existing.length === 0) {
            // Provision (Auto-assign)
            await connection.execute(
                "INSERT INTO user_tasks (user_id, task_id, status, assigned_at) VALUES (?, ?, 'pending', NOW())",
                [userId, task.task_id]
            );
        }
    }

    await connection.commit();

    // 4. Return formatted data using the model which now needs to filter by today
    return await Task.getTasksByLevel(currentLevelId, userId);

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const assignTask = async (userId, taskId) => {
  // Deprecated usage for basic flow, but kept for compatibility or specific advanced tasks?
  // With "implicit assignment", this is less critical but good for tracking "started" state if needed.
  const task = await Task.getTaskById(taskId);
  if (!task) throw new Error("Nhiệm vụ không tồn tại");

  const levelHistoryService = require("./userLevelHistory.service");
  const currentLevelId = await levelHistoryService.ensureUserLevel(userId);
  
  if (Number(currentLevelId) !== Number(task.level_id)) {
    throw new Error("Nhiệm vụ không thuộc cấp độ hiện tại của bạn");
  }

  return await Task.assign(userId, taskId);
};

const completeTask = async (userId, taskId) => {
  const db = require("../config/db");
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get task details
    const [tasks] = await connection.execute(
      "SELECT * FROM tasks WHERE task_id = ?",
      [taskId]
    );

    if (tasks.length === 0) throw new Error("Không tìm thấy nhiệm vụ");
    const task = tasks[0];

    // 2. Verify Level Match
    const levelHistoryService = require("./userLevelHistory.service");
    // ensureUserLevel might create a new level, using pool. Safe here.
    const currentLevelId = await levelHistoryService.ensureUserLevel(userId);
    
    if (Number(currentLevelId) !== Number(task.level_id)) {
        throw new Error("Bạn chưa đạt cấp độ để thực hiện nhiệm vụ này");
    }

    // 3. Check existing status for TODAY
    const today = new Date().toISOString().slice(0, 10);
    const [userTasks] = await connection.execute(
        "SELECT * FROM user_tasks WHERE user_id = ? AND task_id = ? AND DATE(assigned_at) = ?",
        [userId, taskId, today]
    );

    let alreadyCompleted = false;
    if (userTasks.length > 0) {
        if (userTasks[0].status === 'completed') {
            alreadyCompleted = true; 
            throw new Error("Nhiệm vụ đã hoàn thành");
        }
        
        // Update existing pending task for TODAY
        await connection.execute(
            "UPDATE user_tasks SET status = 'completed', completed_at = NOW() WHERE user_id = ? AND task_id = ? AND DATE(assigned_at) = ?",
            [userId, taskId, today]
        );
    } else {
        // Implicit Assign & Complete
        await connection.execute(
            "INSERT INTO user_tasks (user_id, task_id, status, assigned_at, completed_at) VALUES (?, ?, 'completed', NOW(), NOW())",
            [userId, taskId]
        );
    }

    // 4. Award points
    const pointsReward = task.points_awarded ?? 0;
    if (pointsReward > 0) {
        await connection.execute(
            "INSERT INTO user_points (user_id, total_points) VALUES (?, ?) ON DUPLICATE KEY UPDATE total_points = total_points + ?",
            [userId, pointsReward, pointsReward]
        );
    }

    await connection.commit();
    return { 
        status: 'completed', 
        pointsAwarded: pointsReward,
        message: `Hoàn thành nhiệm vụ! Bạn nhận được ${pointsReward} điểm.`
    };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const completeTaskByName = async (userId, taskName) => {
    const db = require("../config/db");
    const connection = await db.getConnection();
    
    try {
        // Find task by name AND user's current level (to ensure we complete the right version if duplicates exists, though seeds shouldn't have dups)
        // Actually, just finding by name is risky if multiple levels have same name. 
        // For now, assuming names are unique enough or we prioritize the one matching user level.
        
        const levelHistoryService = require("./userLevelHistory.service");
        // We use ensureUserLevel to get current level ID
        let currentLevelId = await levelHistoryService.ensureUserLevel(userId);

        const [tasks] = await connection.execute(
            "SELECT task_id, level_id FROM tasks WHERE task_name = ? AND level_id = ?",
            [taskName, currentLevelId]
        );

        if (tasks.length === 0) {
            // Task not found for this level. 
            // Silent return is better for auto-triggers to avoid breaking main flow if task doesn't exist.
            console.log(`[AutoTask] Task '${taskName}' not found for User ${userId} (Level ${currentLevelId})`);
            return null;
        }

        const taskId = tasks[0].task_id;
        console.log(`[AutoTask] Triggering '${taskName}' (ID: ${taskId}) for User ${userId}`);
        
        // Return result of completion
        // We release THIS connection and let completeTask handle its own transaction/connection.
        // completeTask creates its own connection pool usage.
        return await completeTask(userId, taskId);

    } catch (error) {
        console.error(`[AutoTask] Error completing '${taskName}':`, error.message);
        // Don't throw to avoid blocking main user action (e.g. reading story)
        return null;
    } finally {
        connection.release();
    }
};

module.exports = {
  getAllTasks,
  completeTask,
  completeTaskByName
};
