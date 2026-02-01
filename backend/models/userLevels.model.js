const db = require("../config/db");

const UserLevel = {
  getAll: async (limit = 10, offset = 0) => {
    const [rows] = await db.execute(
      "SELECT * FROM user_levels LIMIT ? OFFSET ?",
      [parseInt(limit), parseInt(offset)]
    );
    return rows;
  },

  getCount: async () => {
    const [rows] = await db.execute("SELECT COUNT(*) as total FROM user_levels");
    return rows[0].total;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM user_levels WHERE level_id = ?",
      [id]
    );
    return rows[0];
  },
};

module.exports = UserLevel;
