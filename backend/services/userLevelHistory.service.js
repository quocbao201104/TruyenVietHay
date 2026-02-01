const UserLevelHistory = require("../models/userLevelHistory.model");
const UserLevel = require("../models/userLevels.model");
const UserPoints = require("../models/userPoint.model");

const getHistoryByUserId = async (userId, pagination = {}) => {
  try {
    const { limit = 10, offset = 0 } = pagination;
    const history = await UserLevelHistory.getByUserId(userId, limit, offset);
    const total = await UserLevelHistory.getCountByUserId(userId);
    return { data: history, total };
  } catch (error) {
    throw new Error("Lỗi khi lấy lịch sử cấp bậc: " + error.message);
  }
};

const createHistory = async (data) => {
  try {
    // Lấy thông tin cấp bậc cũ và mới
    const oldLevel = await UserLevel.getById(data.old_level_id); 
    const newLevel = await UserLevel.getById(data.level_id); 

    if (!oldLevel || !newLevel) {
      throw new Error("Không tìm thấy cấp bậc với ID");
    }

    // Tính toán số ngày đã tiêu hao từ cấp bậc cũ
    const timeSpent = data.timeSpent || 0; 

    // Tính toán số ngày còn lại trong cấp bậc mới
    const remainingLifespan = newLevel.lifespan - timeSpent;

    // Tính toán end_date của cấp bậc mới
    const start_date = new Date();
    const end_date = new Date(start_date);
    end_date.setDate(start_date.getDate() + remainingLifespan);

    // Lưu lịch sử cấp bậc vào DB
    const historyData = {
      user_id: data.user_id,
      level_id: data.level_id,
      start_date: start_date,
      end_date: end_date,
    };

    const insertId = await UserLevelHistory.create(historyData);
    return insertId;
  } catch (error) {
    throw new Error("Lỗi khi tạo lịch sử cấp bậc: " + error.message);
  }
};

const autoUpgrade = async (user_id) => {
  const db = require("../config/db");
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Get current points with pessimistic lock
    const [userPoints] = await connection.execute(
      "SELECT total_points FROM user_points WHERE user_id = ? FOR UPDATE",
      [user_id]
    );

    if (userPoints.length === 0) {
      throw new Error("Không tìm thấy thông tin điểm của người dùng");
    }

    const { total_points } = userPoints[0];

    // H3: Get current level from user_levels_history (source of truth)
    const [history] = await connection.execute(
      "SELECT level_id, start_date FROM user_levels_history WHERE user_id = ? ORDER BY start_date DESC LIMIT 1",
      [user_id]
    );

    if (history.length === 0) {
      throw new Error("Người dùng chưa có cấp bậc để thăng cấp");
    }

    const current = history[0];
    const current_level_id = current.level_id;

    // Fetch definition of current level to find next path
    const [currentLevelDefs] = await connection.execute(
        "SELECT * FROM user_levels WHERE level_id = ?",
        [current_level_id]
    );

    if (currentLevelDefs.length === 0) {
        throw new Error("Dữ liệu cấp độ hiện tại không tồn tại");
    }
    const currentLevelDef = currentLevelDefs[0];

    // Check if max level reached
    if (!currentLevelDef.next_level_id) {
        throw new Error("Bạn đã đạt cấp độ tối đa, không thể thăng cấp thêm.");
    }

    const next_level_id = currentLevelDef.next_level_id;

    // Check next level exists and get requirements
    const [nextLevels] = await connection.execute(
      "SELECT * FROM user_levels WHERE level_id = ?",
      [next_level_id]
    );

    if (nextLevels.length === 0) {
      throw new Error("Dữ liệu cấp độ tiếp theo không tồn tại");
    }

    const nextLevel = nextLevels[0];

    // --- CONSTRAINTS CHECK ---
    // Rule: User role must match the target level type
    const [users] = await connection.execute("SELECT role FROM users WHERE id = ?", [user_id]);
    const userRole = users[0]?.role;

    if (nextLevel.type !== userRole && userRole !== 'admin') {
        // Allow admin to bypass? Or strictly require role match? 
        // User said: "muốn tiếp tục nâng cấp thì phải lên type 'author'"
        // Let's enforce strict match for 'user' -> 'author' transition
        if (nextLevel.type === 'author' && userRole === 'user') {
             throw new Error(`Bạn cần nâng cấp tài khoản lên Tác giả (Author) để lên cấp ${nextLevel.name}`);
        }
        // General type mismatch check if needed, but safe to assume admin can be anything or specific logic
        if (nextLevel.type !== userRole && userRole !== 'admin') {
            throw new Error(`C cấp độ này yêu cầu vai trò ${nextLevel.type}`);
        }
    }

    // Check points requirement
    if (total_points < nextLevel.required_points) {
      throw new Error(`Chưa đủ điểm. Cần ${nextLevel.required_points} điểm để thăng cấp.`);
    }

    // --- LIFESPAN CALCULATION (CUMULATIVE) ---
    // User requirement: New Expiry = Root Start Date + New Level Lifespan
    // 1. Find the root start date (Day 0 of Level 1)
    const [rootHistory] = await connection.execute(
        "SELECT start_date FROM user_levels_history WHERE user_id = ? ORDER BY start_date ASC LIMIT 1",
        [user_id]
    );
    
    // Fallback: If no history (shouldn't happen if upgrading), use current.start_date or NOW
    let rootStartDate = new Date();
    if (rootHistory.length > 0) {
        rootStartDate = new Date(rootHistory[0].start_date);
    }

    const lifespanDays = nextLevel.lifespan || 365; // Default 365 if null
    
    // Calculate new end date based on Root Date
    const end_date_history = new Date(rootStartDate.getTime() + lifespanDays * 24 * 60 * 60 * 1000);
    
    // Current time for history start
    const now = new Date();

    // Insert new history record
    await connection.execute(
      "INSERT INTO user_levels_history (user_id, level_id, start_date, end_date) VALUES (?, ?, ?, ?)",
      [user_id, next_level_id, now, end_date_history]
    );

    // Update expiry_date in user_points (account status)
    await connection.execute(
        "UPDATE user_points SET expiry_date = ? WHERE user_id = ?",
        [end_date_history, user_id]
    );

    await connection.commit();
    return { 
        new_level_id: next_level_id, 
        message: `Chúc mừng! Bạn đã thăng lên cấp ${next_level_id} (${nextLevel.name}). Hạn sử dụng tài khoản đến ${end_date_history.toLocaleDateString('vi-VN')}` 
    };
  } catch (error) {
    await connection.rollback();
    throw error;
    connection.release();
  }
};

const ensureUserLevel = async (userId) => {
    // Check if user has level history
    const currentLevelId = await UserLevelHistory.getCurrentLevelOfUser(userId);
    if (currentLevelId) {
        return currentLevelId;
    }

    // No history, find default based on role
    const db = require("../config/db");
    const [users] = await db.execute("SELECT role FROM users_new WHERE id = ?", [userId]); // Note: users_new based on previous debug
    
    // Fallback if user not found (shouldn't happen)
    if (users.length === 0) return 1; 

    const userRole = users[0].role;

    // Find lowest level for this role
    const [levels] = await db.execute(
        "SELECT level_id, lifespan FROM user_levels WHERE type = ? ORDER BY required_points ASC, level_id ASC LIMIT 1",
        [userRole]
    );

    let defaultLevelId = 1; 
    let lifespan = 365;

    if (levels.length > 0) {
        defaultLevelId = levels[0].level_id;
        lifespan = levels[0].lifespan || 365;
    } else {
        // Fallback: if 'author' has no levels defined, maybe fallback to 'user' levels? 
        // Or just hardcode 1.
        console.warn(`No levels defined for role ${userRole}, defaulting to 1`);
    }

    // Create history record
    const now = new Date();
    const end_date = new Date(now.getTime() + lifespan * 24 * 60 * 60 * 1000);

    await UserLevelHistory.create({
        user_id: userId,
        level_id: defaultLevelId,
        start_date: now,
        end_date: end_date
    });

    return defaultLevelId;
};

module.exports = {
  getHistoryByUserId,
  createHistory,
  autoUpgrade,
  ensureUserLevel
};
