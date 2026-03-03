const db = require("../config/db");
const { getOrSet } = require("../utils/cache");

const Rating = {
  // Tạo hoặc cập nhật đánh giá
  upsertRating: async (userId, truyenId, rating) => {
    // Check if user already rated
    const [existing] = await db.query(
      `SELECT rating FROM ratings WHERE user_id = ? AND truyen_id = ?`,
      [userId, truyenId]
    );

    const isNew = existing.length === 0;
    const oldRating = isNew ? 0 : existing[0].rating;

    const [result] = await db.query(
      `INSERT INTO ratings (user_id, truyen_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = ?, updated_at = CURRENT_TIMESTAMP`,
      [userId, truyenId, rating, rating]
    );

    // Update truyen_new table mathematically
    if (isNew) {
      await db.query(
        `UPDATE truyen_new 
         SET rating = ((rating * rating_count) + ?) / (rating_count + 1),
             rating_count = rating_count + 1,
             hot_score = (((rating * rating_count) + ?) / (rating_count + 1) * 0.4) + ((rating_count + 1) * 0.3) + (luot_xem * 0.3)
         WHERE id = ?`,
        [rating, rating, truyenId]
      );
    } else if (oldRating !== rating) {
      // Only recalculate if rating actually changed
      await db.query(
        `UPDATE truyen_new 
         SET rating = ((rating * rating_count) - ? + ?) / rating_count,
             hot_score = (((rating * rating_count) - ? + ?) / rating_count * 0.4) + (rating_count * 0.3) + (luot_xem * 0.3)
         WHERE id = ? AND rating_count > 0`,
        [oldRating, rating, oldRating, rating, truyenId]
      );
    }

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

  // Lấy trung bình sao từ truyen_new
  getAverageRating: async (truyenId) => {
    const [rows] = await db.query(
      `SELECT rating AS avg_rating, rating_count AS total_ratings
       FROM truyen_new WHERE id = ?`,
      [truyenId]
    );
    return rows[0];
  },

  //Lấy tất cả truyện có rating, sắp xếp theo rating trung bình
  getAllTopRatedStories: async (limit = 50) => {
    const cacheKey = `topRated:${limit}`;
    
    return getOrSet(
      cacheKey,
      600, // 10 minutes TTL (expensive aggregation with JOIN)
      async () => {
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
            t.rating AS avg_rating,
            t.rating_count AS total_ratings
           FROM truyen_new t
           WHERE t.trang_thai_kiem_duyet = 'duyet' AND t.rating_count > 0
           ORDER BY t.rating DESC, t.rating_count DESC
           LIMIT ?`,
          [limit]
        );
        return rows;
      }
    );
  },
};

module.exports = Rating;
