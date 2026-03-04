// backend/models/inventory.model.js
const db = require("../config/db");

const InventoryModel = {
  // ============================================================
  // Lấy toàn bộ huy hiệu mà user đang sở hữu trong túi đồ
  // ============================================================
  getUserBadges: async (userId) => {
    const [rows] = await db.query(
      `SELECT
         ui.reward_id,
         ui.is_equipped,
         lb.badge_name,
         lb.icon_url,
         lb.color
       FROM user_inventory ui
       JOIN rewards r    ON ui.reward_id  = r.reward_id
       JOIN level_badges lb ON r.reward_id = lb.reward_id
       WHERE ui.user_id    = ?
         AND r.reward_type = 'badge'
       ORDER BY lb.id ASC`,
      [userId]
    );
    return rows;
  },

  // ============================================================
  // Kiểm tra user có sở hữu reward này và nó có phải badge không
  // ============================================================
  getBadgeOwnership: async (userId, rewardId) => {
    const [[row]] = await db.query(
      `SELECT ui.reward_id, r.reward_type
       FROM user_inventory ui
       JOIN rewards r ON ui.reward_id = r.reward_id
       WHERE ui.user_id  = ?
         AND ui.reward_id = ?
       LIMIT 1`,
      [userId, rewardId]
    );
    return row || null;
  },

  // ============================================================
  // TRANSACTION: Lột huy hiệu cũ → đeo huy hiệu mới
  // ============================================================
  equipBadge: async (userId, rewardId) => {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Bước 1: Xác thực tư cách sở hữu và loại phần thưởng
      const [[ownership]] = await connection.query(
        `SELECT ui.reward_id, r.reward_type
         FROM user_inventory ui
         JOIN rewards r ON ui.reward_id = r.reward_id
         WHERE ui.user_id   = ?
           AND ui.reward_id = ?
         LIMIT 1`,
        [userId, rewardId]
      );

      if (!ownership) {
        throw new Error("Bạn không sở hữu huy hiệu này.");
      }
      if (ownership.reward_type !== "badge") {
        throw new Error("Vật phẩm này không phải huy hiệu (badge).");
      }

      // Bước 2: Tháo tất cả huy hiệu đang đeo của user này
      await connection.query(
        `UPDATE user_inventory ui
         JOIN rewards r ON ui.reward_id = r.reward_id
         SET ui.is_equipped = 0
         WHERE ui.user_id    = ?
           AND r.reward_type = 'badge'`,
        [userId]
      );

      // Bước 3: Đeo huy hiệu mới được chọn
      await connection.query(
        `UPDATE user_inventory
         SET is_equipped = 1
         WHERE user_id  = ?
           AND reward_id = ?`,
        [userId, rewardId]
      );

      // Bước 4: Commit thành công
      await connection.commit();

      return { reward_id: rewardId };
    } catch (error) {
      // Rollback toàn bộ nếu có bất kỳ lỗi nào
      await connection.rollback();
      throw error;
    } finally {
      // Luôn trả connection về pool
      connection.release();
    }
  },

  // ============================================================
  // Batch fetch: Lấy huy hiệu đang đeo của nhiều user cùng lúc
  // Trả về Map<user_id, badge_info>
  // ============================================================
  getEquippedBadgesForUsers: async (userIds) => {
    if (!userIds || userIds.length === 0) return new Map();
    
    const placeholders = userIds.map(() => '?').join(',');
    const [rows] = await db.query(
      `SELECT ui.user_id, lb.badge_name, lb.icon_url, lb.color, r.rarity
       FROM user_inventory ui
       JOIN rewards r ON ui.reward_id = r.reward_id
       JOIN level_badges lb ON r.reward_id = lb.reward_id
       WHERE ui.user_id IN (${placeholders})
         AND ui.is_equipped = 1
         AND r.reward_type = 'badge'`,
      userIds
    );

    const map = new Map();
    for (const row of rows) {
      map.set(row.user_id, {
         badge_name: row.badge_name,
         icon_url: row.icon_url,
         color: row.color,
         rarity: row.rarity
      });
    }
    return map;
  }
};

module.exports = InventoryModel;
