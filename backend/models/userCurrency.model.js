const db = require("../config/db");
const EXPIRATION_WINDOW_MS = 10000; // 10 seconds for idempotency check

const UserCurrency = {
  getBalance: async (userId) => {
    const [rows] = await db.query(
      "SELECT linh_thach FROM users_new WHERE id = ?",
      [userId]
    );
    return rows.length > 0 ? rows[0].linh_thach : 0;
  },

  // Create wallet if not exists - users_new already exists, so this is just a fallback
  ensureWallet: async (userId, connection) => {
    // Unnecessary to insert into users_new here as the user already exists.
    // Kept for interface compatibility.
  },

  add: async (userId, amount, connection) => {
    const conn = connection || db;
    await conn.execute(
      "UPDATE users_new SET linh_thach = linh_thach + ? WHERE id = ?",
      [amount, userId]
    );
  },

  deduct: async (userId, amount, connection) => {
    if (!connection) {
        throw new Error("deduct() must be called within a transaction");
    }

    // Pessimistic Lock: Ensure user has enough balance and lock row
    const [balance] = await connection.execute(
        "SELECT linh_thach FROM users_new WHERE id = ? FOR UPDATE",
        [userId]
    );

    if (balance.length === 0 || balance[0].linh_thach < amount) {
        throw new Error("Không đủ Linh Thạch");
    }

    // Safe Update
    await connection.execute(
        "UPDATE users_new SET linh_thach = linh_thach - ? WHERE id = ?",
        [amount, userId]
    );
  }
};

module.exports = UserCurrency;
