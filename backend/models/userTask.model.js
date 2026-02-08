const db = require("../config/db");

const Task = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM tasks");
    return rows;
  },

  assign: async (userId, taskId) => {
    // H14: Check if task already assigned
    const [existing] = await db.execute(
      "SELECT * FROM user_tasks WHERE user_id = ? AND task_id = ?",
      [userId, taskId]
    );

    if (existing.length > 0) {
      throw new Error("Nhiệm vụ đã được gán cho người dùng này");
    }

    const [rows] = await db.query(
      "INSERT INTO user_tasks (user_id, task_id, status) VALUES (?, ?, 'pending')",
      [userId, taskId]
    );
    return rows.insertId;
  },

  complete: async (userId, taskId) => {
    const [rows] = await db.query(
      'UPDATE user_tasks SET status = "completed", completed_at = NOW() WHERE user_id = ? AND task_id = ?',
      [userId, taskId]
    );
    return rows.affectedRows;
  },

  getTaskById: async (taskId) => {
    const [rows] = await db.execute("SELECT * FROM tasks WHERE task_id = ?", [
      taskId,
    ]);
    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  },

  getTasksByLevel: async (levelId, userId) => {
    const sql = `
      SELECT t.*, 
        (SELECT status FROM user_tasks ut 
         WHERE ut.task_id = t.task_id 
           AND ut.user_id = ? 
           AND (
                (t.repeat_type = 'daily' AND DATE(ut.assigned_at) = CURDATE())
                OR (t.repeat_type = 'once')
           )
         ORDER BY ut.assigned_at DESC LIMIT 1
        ) as status,
        (SELECT id FROM user_tasks ut 
         WHERE ut.task_id = t.task_id 
           AND ut.user_id = ? 
           AND (
                (t.repeat_type = 'daily' AND DATE(ut.assigned_at) = CURDATE())
                OR (t.repeat_type = 'once')
           )
         ORDER BY ut.assigned_at DESC LIMIT 1
        ) as user_task_id
      FROM tasks t
      WHERE (t.level_id = ? OR t.level_id IS NULL)
    `;
    const [rows] = await db.execute(sql, [userId, userId, levelId]);
    return rows;
  }
};

module.exports = Task;
