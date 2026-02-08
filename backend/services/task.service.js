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
    
    // Fetch Task Definitions (Current Level OR Global)
    const [taskDefs] = await connection.execute(
        "SELECT * FROM tasks WHERE level_id = ? OR level_id IS NULL",
        [currentLevelId]
    );

    // 3. Optimized Provisioning (Batch Check)
    const today = new Date().toISOString().slice(0, 10);

    // Fetch ALL assigned tasks for this user (to check 'once' and 'daily')
    // We only care about Task IDs and Dates
    const [existingRows] = await connection.execute(
        "SELECT task_id, assigned_at, status FROM user_tasks WHERE user_id = ?",
        [userId]
    );

    // Map: task_id -> { hasToday, hasEver }
    const taskStatusMap = new Map();
    for (const row of existingRows) {
        const tId = row.task_id;
        const rowDate = new Date(row.assigned_at).toISOString().slice(0, 10);
        
        if (!taskStatusMap.has(tId)) {
            taskStatusMap.set(tId, { hasToday: false, hasEver: true });
        }
        if (rowDate === today) {
            taskStatusMap.get(tId).hasToday = true;
        }
    }

    const tasksToInsert = [];

    for (const task of taskDefs) {
        const repeatType = task.repeat_type || 'daily';
        let shouldProvision = false;
        const status = taskStatusMap.get(task.task_id);

        if (repeatType === 'once') {
             // Provision if NEVER exists
             if (!status || !status.hasEver) shouldProvision = true;
        } else if (repeatType === 'daily') {
             // Provision if NOT exists TODAY
             if (!status || !status.hasToday) shouldProvision = true;
        } else if (repeatType === 'infinite') {
             // No provisioning for infinite (actions)
             shouldProvision = false;
        }

        if (shouldProvision) {
            tasksToInsert.push([userId, task.task_id, 'pending', new Date()]);
        }
    }

    if (tasksToInsert.length > 0) {
        // Bulk Insert (MySQL2 helper needed or raw SQL)
        // connection.query with nested array works for bulk insert
        // But execute doesn't support bulk well with simple syntax?
        // Use query instead of execute for bulk
        // "INSERT INTO user_tasks (user_id, task_id, status, assigned_at) VALUES ?"
        await connection.query(
            "INSERT INTO user_tasks (user_id, task_id, status, assigned_at) VALUES ?",
            [tasksToInsert]
        );
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
    
    if (task.level_id !== null && Number(currentLevelId) !== Number(task.level_id)) {
        throw new Error("Bạn chưa đạt cấp độ để thực hiện nhiệm vụ này");
    }

    // 3. Check existing status based on repeat_type
    const repeatType = task.repeat_type || 'daily';
    let userTasks = [];

    if (repeatType === 'once') {
        [userTasks] = await connection.execute(
             "SELECT * FROM user_tasks WHERE user_id = ? AND task_id = ? FOR UPDATE",
             [userId, taskId]
        );
    } else if (repeatType === 'daily') {
        const today = new Date().toISOString().slice(0, 10);
        [userTasks] = await connection.execute(
             "SELECT * FROM user_tasks WHERE user_id = ? AND task_id = ? AND DATE(assigned_at) = ? FOR UPDATE",
             [userId, taskId, today]
        );
    } else {
        // Infinite: We don't check for existing completion to block.
        // We always allow.
        userTasks = []; 
    }

    if (userTasks.length > 0 && userTasks[0].status === 'completed') {
        // For 'once' and 'daily', if completed, stop.
        if (repeatType !== 'infinite') {
             throw new Error("Nhiệm vụ đã hoàn thành");
        }
    }
    
    // For Infinite: Always Insert New Completed Record?
    // Or Update the 'pending' one if exists?
    // Let's Insert New for history tracking.
    if (repeatType === 'infinite' || userTasks.length === 0) {
         await connection.execute(
            "INSERT INTO user_tasks (user_id, task_id, status, assigned_at, completed_at) VALUES (?, ?, 'completed', NOW(), NOW())",
            [userId, taskId]
        );
    } else {
        // Update existing pending (for Daily/Once)
        await connection.execute(
            "UPDATE user_tasks SET status = 'completed', completed_at = NOW() WHERE id = ?",
            [userTasks[0].id]
        );
    }

    // 4. Award points
    const pointsReward = task.points_awarded ?? 0;
    if (pointsReward > 0) {
        await connection.execute(
            "INSERT INTO user_points (user_id, total_exp) VALUES (?, ?) ON DUPLICATE KEY UPDATE total_exp = total_exp + ?",
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
    // FIX: Removed redundant DB connection (Issue #9)
    // We don't need a transaction just to lookup the task ID
    // completeTask() handles its own transaction
    const db = require("../config/db");
    
    try {
        const levelHistoryService = require("./userLevelHistory.service");
        let currentLevelId = await levelHistoryService.ensureUserLevel(userId);

        // Simple query without transaction overhead
        const [tasks] = await db.execute(
            "SELECT task_id, level_id FROM tasks WHERE task_name = ? AND (level_id = ? OR level_id IS NULL)",
            [taskName, currentLevelId]
        );

        if (tasks.length === 0) {
            console.log(`[AutoTask] Task '${taskName}' not found for User ${userId} (Level ${currentLevelId})`);
            return null;
        }

        const taskId = tasks[0].task_id;
        console.log(`[AutoTask] Triggering '${taskName}' (ID: ${taskId}) for User ${userId}`);
        
        // Call the service method which manages its own connection/transaction
        return await completeTask(userId, taskId);

    } catch (error) {
        console.error(`[AutoTask] Error completing '${taskName}':`, error.message);
        return null; // Don't throw to avoid blocking main user flow
    }
};

module.exports = {
  getAllTasks,
  completeTask,
  completeTaskByName
};
