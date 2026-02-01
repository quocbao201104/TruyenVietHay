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
