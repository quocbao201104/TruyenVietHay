const db = require("../config/db");

const UserLevelHistory = {
  getByUserId: async (userId, limit = 10, offset = 0) => {
    const [rows] = await db.query(
      `SELECT 
        h.*, 
        l.name as name, 
        nl.name as next_level_name,
        nl.required_points as next_level_points
      FROM user_levels_history h
      LEFT JOIN user_levels l ON h.level_id = l.level_id
      LEFT JOIN user_levels nl ON l.next_level_id = nl.level_id
      WHERE h.user_id = ? 
      ORDER BY h.start_date DESC 
      LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );
    return rows;
  },

  getCountByUserId: async (userId) => {
    const [rows] = await db.query(
      "SELECT COUNT(*) as total FROM user_levels_history WHERE user_id = ?",
      [userId]
    );
    return rows[0].total;
  },

  create: async (data) => {
    const { user_id, level_id, start_date, end_date } = data;
    const [result] = await db.query(
      "INSERT INTO user_levels_history (user_id, level_id, start_date, end_date) VALUES (?, ?, ?, ?)",
      [user_id, level_id, start_date, end_date]
    );
    return result.insertId;
  },
  getCurrentLevelOfUser: async (userId) => {
    const [rows] = await db.execute(
      `SELECT level_id 
       FROM user_levels_history 
       WHERE user_id = ? 
       ORDER BY start_date DESC 
       LIMIT 1`,
      [userId]
    );
    return rows[0] ? rows[0].level_id : null;
  },

  /**
   * Batch-fetch the latest level_id for multiple users in ONE query.
   * Uses a MAX(start_date) subquery to get the most-recent history row per user.
   *
   * @param {number[]} userIds
   * @returns {Promise<Map<number, number>>} Map<user_id, level_id>
   */
  getCurrentLevelsForUsers: async (userIds) => {
    if (!userIds || userIds.length === 0) return new Map();

    const placeholders = userIds.map(() => "?").join(",");
    const [rows] = await db.query(
      `SELECT h.user_id, h.level_id
       FROM user_levels_history h
       INNER JOIN (
         SELECT user_id, MAX(start_date) AS max_start
         FROM user_levels_history
         WHERE user_id IN (${placeholders})
         GROUP BY user_id
       ) latest ON h.user_id = latest.user_id AND h.start_date = latest.max_start`,
      userIds
    );

    const map = new Map();
    for (const row of rows) {
      map.set(row.user_id, row.level_id);
    }
    return map;
  },
};

module.exports = UserLevelHistory;
