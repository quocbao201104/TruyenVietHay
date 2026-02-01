const db = require("../config/db");
const EXPIRATION_WINDOW_MS = 10000; // 10 seconds for idempotency check

const UserCurrency = {
  getBalance: async (userId) => {
    const [rows] = await db.query(
      "SELECT linh_thach FROM user_currency WHERE user_id = ?",
      [userId]
    );
    return rows.length > 0 ? rows[0].linh_thach : 0;
  },

  // Create wallet if not exists (usually on register, but safe fallback)
  ensureWallet: async (userId, connection) => {
    const conn = connection || db;
    await conn.execute(
        "INSERT INTO user_currency (user_id, linh_thach) VALUES (?, 0) ON DUPLICATE KEY UPDATE user_id=user_id",
        [userId]
    );
  },

  add: async (userId, amount, connection) => {
    const conn = connection || db;
    await UserCurrency.ensureWallet(userId, conn);
    await conn.execute(
      "UPDATE user_currency SET linh_thach = linh_thach + ? WHERE user_id = ?",
      [amount, userId]
    );
  },

  deduct: async (userId, amount, connection) => {
     const conn = connection || db;
     // Helper specifically for spending, ensures non-negative
     const [result] = await conn.execute(
        "UPDATE user_currency SET linh_thach = linh_thach - ? WHERE user_id = ? AND linh_thach >= ?",
        [amount, userId, amount]
     );
     
     if (result.affectedRows === 0) {
         // Could be user check or balance check.
         const balance = await UserCurrency.getBalance(userId);
         if (balance < amount) throw new Error("Không đủ Linh Thạch");
         // If balance was enough but row not updated, user might not exist?
         throw new Error("Lỗi giao dịch tài chính");
     }
  }
};

module.exports = UserCurrency;
