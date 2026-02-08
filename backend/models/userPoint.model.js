const db = require("../config/db");

const UserPoint = {
  getPointsByUserId: async (userId) => {
    try {
      const [rows] = await db.execute(
        "SELECT total_exp, expiry_date FROM user_points WHERE user_id = ?",
        [userId]
      );
      if (rows.length === 0) {
        return null;
      }
      return rows[0];
    } catch (error) {
      throw new Error("Lỗi khi lấy điểm người dùng: " + error.message);
    }
  },

  createOrUpdate: async ({ user_id, points }) => {
    console.log("createOrUpdate:", { user_id, points });

    // Prevent negative points from reducing total below 0 (C6 fix)
    const [rows] = await db.execute(
      `INSERT INTO user_points (user_id, total_exp) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE total_exp = GREATEST(0, total_exp + ?)`,
      [user_id, points, points]
    );

    return rows;
  },


};

module.exports = UserPoint;
