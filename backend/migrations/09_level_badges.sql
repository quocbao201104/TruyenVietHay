-- ============================================================
-- Migration 09: Level Badge System
-- Stores one badge row per cultivation realm (level range).
-- Badge lookup: match current level_id against min_level/max_level.
-- icon_url is populated by the Cloudinary upload script after creation.
-- ============================================================

CREATE TABLE IF NOT EXISTS level_badges (
  id            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  min_level_id  INT UNSIGNED     NOT NULL COMMENT 'Lowest level_id (inclusive) covered by this badge',
  max_level_id  INT UNSIGNED     NOT NULL COMMENT 'Highest level_id (inclusive) covered by this badge',
  badge_name    VARCHAR(100)     NOT NULL COMMENT 'Display name, e.g. Luyện Khí',
  slug          VARCHAR(100)     NOT NULL UNIQUE COMMENT 'Machine-readable key, e.g. luyen-khi',
  icon_filename VARCHAR(150)     NOT NULL COMMENT 'Original filename in public/badge, e.g. luyen-khi.png',
  icon_url      VARCHAR(500)     DEFAULT NULL COMMENT 'Cloudinary CDN URL — populated by upload script',
  rarity        ENUM('common','uncommon','rare','epic','legendary') NOT NULL DEFAULT 'common',
  color         VARCHAR(20)      NOT NULL DEFAULT '#888888' COMMENT 'Hex color for badge border / glow',
  animation_type ENUM('none','pulse','glow','sparkle','flame') NOT NULL DEFAULT 'none',
  is_active     TINYINT(1)       NOT NULL DEFAULT 1,
  sort_order    SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Display order (ascending)',
  -- Seasonal / event override support
  override_icon_url   VARCHAR(500) DEFAULT NULL COMMENT 'Temporary seasonal skin — NULL means use icon_url',
  override_expires_at DATETIME    DEFAULT NULL COMMENT 'When the override expires (NULL = permanent)',
  -- Audit
  created_at    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  -- Fast range-lookup by level_id
  INDEX idx_level_range (min_level_id, max_level_id),
  -- Lookup by slug (used for admin edits and display)
  UNIQUE INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Cultivation realm badges. One row per realm; maps level_id ranges to badge assets.';


-- ============================================================
-- Seed: 8 cultivation realms
-- level_id values correspond to existing rows in user_levels.
-- Adjust min_level_id / max_level_id if your level IDs differ.
-- icon_url will be filled by scripts/upload_badges_to_cloudinary.js
-- ============================================================

INSERT INTO level_badges
  (min_level_id, max_level_id, badge_name, slug, icon_filename, rarity, color, animation_type, sort_order)
VALUES
  (1,  1,  'Luyện Khí',  'luyen-khi',  'luyen-khi.png',  'common',    '#78909C', 'none',    1),
  (2,  2,  'Trúc Cơ',   'truc-co',   'truc-co.png',   'common',    '#66BB6A', 'none',    2),
  (3,  3,  'Kim Đan',   'kim-dan',   'kim-dan.png',   'uncommon',  '#FFA726', 'pulse',   3),
  (4,  4,  'Nguyên Anh', 'nguyen-anh', 'nguyen-anh.png', 'uncommon',  '#AB47BC', 'pulse',   4),
  (5,  5,  'Hóa Thần',  'hoa-than',  'hoa-than.png',  'rare',      '#42A5F5', 'glow',    5),
  (6,  6,  'Luyện Hư',  'luyen-hu',  'luyen-hu.png',  'rare',      '#26C6DA', 'glow',    6),
  (7,  7,  'Hợp Thể',   'hop-the',   'hop-the.png',   'epic',      '#EF5350', 'sparkle', 7),
  (8,  8,  'Đại Thừa',  'dai-thua',  'dai-thua.png',  'legendary', '#FFD700', 'flame',   8)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
