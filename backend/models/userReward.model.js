const db = require("../config/db");

const UserReward = {
  getByUserId: async (userId) => {
    const [rows] = await db.query(
      "SELECT ur.*, r.name FROM user_rewards ur JOIN rewards r ON ur.reward_id = r.reward_id WHERE ur.user_id = ?",
      [userId]
    );
    return rows;
  },

  claim: async ({ user_id, reward_id }) => {
    // H4: Comprehensive reward eligibility checks
    
    // 1. Check reward exists and get required points
    const [rewards] = await db.query(
      "SELECT points_required FROM rewards WHERE reward_id = ?",
      [reward_id]
    );

    if (rewards.length === 0) {
      throw new Error("Phần thưởng không tồn tại");
    }

    const requiredPoints = rewards[0].points_required;

    // 2. Check user has enough points
    const [userPoints] = await db.query(
      "SELECT total_points FROM user_points WHERE user_id = ?",
      [user_id]
    );

    if (!userPoints[0] || userPoints[0].total_points < requiredPoints) {
      throw new Error("Bạn chưa đủ điểm để nhận phần thưởng này");
    }

    // 3. Check if already claimed
    const [existing] = await db.query(
      "SELECT * FROM user_rewards WHERE user_id = ? AND reward_id = ?",
      [user_id, reward_id]
    );

    if (existing.length > 0) {
      throw new Error("Bạn đã nhận phần thưởng này rồi");
    }

    // 4. Claim reward
    const [rows] = await db.query(
      "INSERT INTO user_rewards (user_id, reward_id, received_at) VALUES (?, ?, NOW())",
      [user_id, reward_id]
    );

    return rows.insertId;
  },
};

module.exports = UserReward;
