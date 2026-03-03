// backend/models/levelBadge.model.js
const db = require("../config/db");

const LevelBadgeModel = {
  /**
   * Fetch all active badge rows ordered by sort_order.
   * Called once at boot (or on cache miss) to build the in-memory map.
   */
  getAllActive: async () => {
    const [rows] = await db.query(`
      SELECT id, min_level_id, max_level_id, badge_name, slug,
             icon_url, rarity, color, animation_type, sort_order,
             override_icon_url, override_expires_at
      FROM level_badges
      WHERE is_active = 1
      ORDER BY sort_order ASC
    `);
    return rows;
  },

  /** Fetch a single badge row by its primary key (used by admin routes). */
  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM level_badges WHERE id = ?", [id]);
    return rows[0] || null;
  },

  /** Create a new badge (admin). Returns the inserted id. */
  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO level_badges
         (min_level_id, max_level_id, badge_name, slug, icon_filename, icon_url,
          rarity, color, animation_type, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.min_level_id,
        data.max_level_id,
        data.badge_name,
        data.slug,
        data.icon_filename ?? "",
        data.icon_url ?? null,
        data.rarity    ?? "common",
        data.color     ?? "#888888",
        data.animation_type ?? "none",
        data.is_active  ?? 1,
        data.sort_order ?? 0,
      ]
    );
    return result.insertId;
  },

  /** Update any badge field (admin). Supports partial updates. */
  update: async (id, fields) => {
    const allowed = [
      "min_level_id", "max_level_id", "badge_name", "slug", "icon_filename",
      "icon_url", "rarity", "color", "animation_type", "is_active",
      "sort_order", "override_icon_url", "override_expires_at",
    ];
    const setClauses = [];
    const values     = [];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(fields, key)) {
        setClauses.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }

    if (setClauses.length === 0) return 0;

    values.push(id);
    const [result] = await db.query(
      `UPDATE level_badges SET ${setClauses.join(", ")} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  },

  /** Soft-delete (set is_active = 0) */
  deactivate: async (id) => {
    const [result] = await db.query(
      "UPDATE level_badges SET is_active = 0 WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  },
};

module.exports = LevelBadgeModel;
