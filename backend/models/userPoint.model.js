const db = require("../config/db");

const UserPoint = {
  getPointsByUserId: async (userId) => {
    try {
      const [rows] = await db.execute(
        `SELECT 
            up.user_id, up.total_exp, up.expiry_date, up.current_level_id,
            ul.name as level_name, 
            ul.next_level_id,
            next_ul.name as next_level_name,
            next_ul.required_points as next_level_points
         FROM user_points up
         LEFT JOIN user_levels ul ON up.current_level_id = ul.level_id
         LEFT JOIN user_levels next_ul ON ul.next_level_id = next_ul.level_id
         WHERE up.user_id = ?`,
        [userId]
      );

      if (rows.length === 0) return null;

      // Map lại cấu trúc để Frontend dễ dùng
      const data = rows[0];
      return {
        user_id: data.user_id,
        total_exp: data.total_exp,
        expiry_date: data.expiry_date,
        current_level_id: data.current_level_id,
        // Đóng gói thông tin level vào một object riêng
        level_info: {
          name: data.level_name,
          next_level_id: data.next_level_id,
          next_level_name: data.next_level_name,
          next_level_points: data.next_level_points,
          end_date: data.expiry_date // Thọ nguyên lấy từ expiry_date của user_points
        }
      };
    } catch (error) {
      throw new Error("Lỗi khi lấy điểm và cấp bậc: " + error.message);
    }
  },

  // createOrUpdate giữ nguyên logic của Bảo
  createOrUpdate: async ({ user_id, points }) => {
    return await db.execute(
      `INSERT INTO user_points (user_id, total_exp) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE total_exp = GREATEST(0, total_exp + ?)`,
      [user_id, points, points]
    );
  },
};

module.exports = UserPoint;