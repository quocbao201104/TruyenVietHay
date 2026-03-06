const db = require("../config/db");

const Reward = {
  getAll: async (limit = 10, offset = 0) => {
    const [rows] = await db.query(
      "SELECT * FROM rewards LIMIT ? OFFSET ?",
      [parseInt(limit), parseInt(offset)]
    );
    return rows;
  },

  getCount: async () => {
    const [rows] = await db.query("SELECT COUNT(*) as total FROM rewards");
    return rows[0].total;
  },

  create: async (data) => {
    const { 
        reward_name, description, min_level, price,
        code, reward_type, rarity, icon, 
        is_repeatable, is_active, display_order, 
        duration_hours, metadata 
    } = data;

    const [rows] = await db.query(
      `INSERT INTO rewards 
      (reward_name, description, min_level, price, code, reward_type, rarity, icon, is_repeatable, is_active, display_order, duration_hours, metadata) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reward_name, description, min_level || 1, price || 0,
        code || null, reward_type || 'item', rarity || 'common', icon || null,
        is_repeatable !== undefined ? is_repeatable : true,
        is_active !== undefined ? is_active : true,
        display_order || 0,
        duration_hours || null,
        metadata ? JSON.stringify(metadata) : null
      ]
    );
    return rows.insertId;
  },
};

module.exports = Reward;

// =============================================================
// FUNCTION 1: Gửi quà vào hộp thư khi user lên cấp
// =============================================================

/**
 * Khi user lên cấp mới, query danh sách phần thưởng tương ứng
 * rồi INSERT vào bảng user_rewards (hộp thư) với status = 'pending'.
 *
 * @param {number} userId   - ID của user vừa lên cấp
 * @param {number} newLevel - Cấp độ mới của user
 * @returns {Array}         - Mảng các quà vừa gửi vào hộp thư
 */
const triggerLevelUpRewards = async (userId, newLevel) => {
  // Bước 1: Lấy danh sách phần thưởng cấu hình cho cấp độ này
  const [levelRewards] = await db.query(
    `SELECT lr.reward_id, lr.quantity, r.reward_type, r.metadata
     FROM level_rewards lr
     JOIN rewards r ON lr.reward_id = r.reward_id
     WHERE lr.level_id = ?`,
    [newLevel]
  );

  // Nếu không có phần thưởng cho cấp này thì bỏ qua
  if (!levelRewards || levelRewards.length === 0) {
    return [];
  }

  // Bước 2: Lọc bỏ các phần thưởng đã nhận (Tránh trùng lặp - Idempotency)
  const [existingRewards] = await db.query(
    `SELECT reward_id FROM user_rewards WHERE user_id = ? AND source = 'level'`,
    [userId]
  );
  const existingIdSet = new Set(existingRewards.map(r => r.reward_id));
  
  const newRewards = levelRewards.filter(r => !existingIdSet.has(r.reward_id));

  if (newRewards.length === 0) {
    return [];
  }

  // Bước 3: Chuẩn bị dữ liệu để INSERT hàng loạt vào user_rewards
  const insertRows = newRewards.map((r) => [
    userId,
    r.reward_id,
    r.quantity,
    "unlocked",
    "level",
  ]);

  // Bước 4: Bulk insert
  await db.query(
    `INSERT INTO user_rewards (user_id, reward_id, quantity, status, source) VALUES ?`,
    [insertRows]
  );

  return newRewards.map((r) => ({
    reward_id: r.reward_id,
    reward_type: r.reward_type,
    quantity: r.quantity,
  }));
};

// =============================================================
// FUNCTION 2: User bấm nhận quà từ hộp thư
// =============================================================

/**
 * Xử lý toàn bộ luồng nhận quà trong 1 MySQL Transaction:
 * 1. Xác thực quà (pending & thuộc về đúng user)
 * 2. Đánh dấu đã nhận (claimed)
 * 3. Phân phát vào túi đồ hoặc cộng thẳng chỉ số
 *
 * @param {number} userId       - ID của user đang nhận quà
 * @param {number} userRewardId - ID của row trong bảng user_rewards
 * @returns {object}            - Kết quả nhận quà
 */
const claimReward = async (userId, userRewardId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // --- Bước 1: Xác thực quà ---
    // Kiểm tra quà có tồn tại, thuộc về đúng user và chưa được nhận chưa
    const [[userReward]] = await connection.query(
      `SELECT ur.*, r.reward_type, r.metadata, r.duration_hours
       FROM user_rewards ur
       JOIN rewards r ON ur.reward_id = r.reward_id
       WHERE ur.id = ? AND ur.user_id = ? AND ur.status = 'unlocked'
       LIMIT 1`,
      [userRewardId, userId]
    );

    if (!userReward) {
      throw new Error("Quà không tồn tại hoặc đã được nhận rồi.");
    }

    // --- Bước 2: Đánh dấu quà là đã nhận ---
    await connection.query(
      `UPDATE user_rewards SET status = 'claimed', claimed_at = NOW() WHERE id = ?`,
      [userRewardId]
    );

    // Giải nén thông tin phân phát
    const { reward_type, metadata, duration_hours, reward_id, quantity } = userReward;
    const meta = typeof metadata === "string" ? JSON.parse(metadata) : (metadata || {});

    // --- Bước 3: Phân phát dựa vào loại phần thưởng ---
    if (reward_type === "currency") {
      // Đọc currency_type từ metadata để biết cộng vào cột nàos
      const currencyType = meta.currency_type || "linh_thach";
      const amount = (meta.amount || 0) * quantity;

      if (currencyType === "linh_thach") {
         // Cộng linh thạch vào bảng users_new 
         await connection.query(
            `UPDATE users_new SET linh_thach = linh_thach + ? WHERE id = ?`,
            [amount, userId]
         );
      } else {
         throw new Error(`currency_type không hỗ trợ: ${currencyType}`);
      }
    } else if (reward_type === "exp") {
      // Cộng kinh nghiệm (EXP) vào total_points trong user_points
      const amount = (meta.amount || 0) * quantity;
      await connection.query(
        `INSERT INTO user_points (user_id, total_exp)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE total_exp = total_exp + VALUES(total_exp)`,
        [userId, amount]
      );
    } else if (["badge", "item", "buff", "title"].includes(reward_type)) {
      // Lưu vật phẩm vào túi đồ cá nhân (user_inventory)
      // Tính hạn sử dụng nếu duration_hours > 0
      let expiresAt = null;
      if (duration_hours && duration_hours > 0) {
        const expireDate = new Date();
        expireDate.setHours(expireDate.getHours() + duration_hours);
        expiresAt = expireDate.toISOString().slice(0, 19).replace("T", " ");
      }

      // ON DUPLICATE KEY UPDATE: cộng dồn số lượng nếu user đã có vật phẩm này
      await connection.query(
        `INSERT INTO user_inventory (user_id, reward_id, quantity, expires_at)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           quantity   = quantity + VALUES(quantity),
           expires_at = IF(VALUES(expires_at) IS NOT NULL, VALUES(expires_at), expires_at)`,
        [userId, reward_id, quantity, expiresAt]
      );
    }
    // Mở rộng thêm reward_type khác tại đây nếu cần

    // --- Bước 4: Commit transaction ---
    await connection.commit();

    return {
      success: true,
      message: "Nhận quà thành công!",
      reward: { reward_type, quantity, metadata: meta },
    };
  } catch (error) {
    // Rollback toàn bộ nếu có bất kỳ lỗi nào
    await connection.rollback();
    throw error;
  } finally {
    // Luôn luôn trả connection về pool
    connection.release();
  }
};

module.exports.triggerLevelUpRewards = triggerLevelUpRewards;
module.exports.claimReward = claimReward;
