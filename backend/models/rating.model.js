const db = require("../config/db");

const Rating = {
  // Tạo hoặc cập nhật đánh giá
  upsertRating: async (userId, truyenId, rating) => {
    const [result] = await db.query(
      `INSERT INTO ratings (user_id, truyen_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = ?, updated_at = CURRENT_TIMESTAMP`,
      [userId, truyenId, rating, rating]
    );
    return result;
  },

  // Lấy tất cả đánh giá theo truyện
  getRatingsByTruyenId: async (truyenId) => {
    const [rows] = await db.query(
      `SELECT r.*, u.full_name FROM ratings r
       JOIN users_new u ON r.user_id = u.id
       WHERE r.truyen_id = ? ORDER BY r.created_at DESC`,
      [truyenId]
    );
    return rows;
  },

  // Tính trung bình sao
  getAverageRating: async (truyenId) => {
    const [rows] = await db.query(
      `SELECT AVG(rating) AS avg_rating, COUNT(*) AS total_ratings
       FROM ratings WHERE truyen_id = ?`,
      [truyenId]
    );
    return rows[0];
  },

  // Lấy tất cả truyện có rating, sắp xếp theo rating trung bình
  getAllTopRatedStories: async (limit = 50) => {
    const [rows] = await db.query(
      `SELECT 
        t.id,
        t.ten_truyen,
        t.slug,
        t.anh_bia,
        t.tac_gia,
        t.luot_xem,
        t.luot_thich,
        t.trang_thai,
        t.thoi_gian_cap_nhat,
        t.so_luong_chuong,
        AVG(r.rating) AS avg_rating,
        COUNT(r.id) AS total_ratings
       FROM truyen_new t
       INNER JOIN ratings r ON t.id = r.truyen_id
       WHERE t.trang_thai_kiem_duyet = 'duyet'
       GROUP BY t.id
       HAVING COUNT(r.id) > 0
       ORDER BY avg_rating DESC, total_ratings DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },
};

module.exports = Rating;
