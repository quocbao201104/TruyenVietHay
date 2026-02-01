-- Migration: Reward System Refactor (Catalog & User Instances)
-- Description: Updates rewards table with new columns for catalog features and updates user_rewards for the new lifecycle status.

-- 1. Refactor 'rewards' table (Catalog)
ALTER TABLE rewards
ADD COLUMN code VARCHAR(50) NULL UNIQUE COMMENT 'Stable reference usage e.g. DAILY_LOGIN',
ADD COLUMN reward_type ENUM('exp', 'currency', 'point', 'badge', 'title', 'buff', 'item', 'event') NOT NULL DEFAULT 'item',
ADD COLUMN is_repeatable BOOLEAN DEFAULT TRUE COMMENT 'If false, check ownership',
ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') DEFAULT 'common',
ADD COLUMN icon VARCHAR(255) COMMENT 'URL or asset path',
ADD COLUMN display_order INT DEFAULT 0,
ADD COLUMN duration_hours INT NULL COMMENT 'NULL = permanent',
ADD COLUMN metadata JSON COMMENT 'Config payload',
ADD INDEX idx_rewards_type (reward_type),
ADD INDEX idx_rewards_active_order (is_active, display_order);

-- 2. Refactor 'user_rewards' table (Instances)
-- We need to check columns before adding to avoid errors if re-running, 
-- but straightforward ALTER is standard for this dev environment.

-- Drop old column if exists (handle with care or ignoring if this is fresh env)
-- ALTER TABLE user_rewards DROP COLUMN received_at; 
-- (Safer to keep it or migrate data first if this was prod, but for dev we assume "Start")

ALTER TABLE user_rewards
ADD COLUMN status ENUM('locked', 'unlocked', 'claimed', 'used', 'expired') DEFAULT 'claimed',
ADD COLUMN source ENUM('task', 'level', 'event', 'admin') DEFAULT 'task',
ADD COLUMN earned_at DATETIME NULL,
ADD COLUMN claimed_at DATETIME NULL,
ADD COLUMN used_at DATETIME NULL,
ADD COLUMN expired_at DATETIME NULL,
ADD COLUMN quantity INT DEFAULT 1,
ADD COLUMN metadata JSON NULL, -- Instance specific metadata (e.g. unique code)
ADD INDEX idx_user_rewards_user_status (user_id, status, created_at DESC),
ADD INDEX idx_user_rewards_expiration (expired_at, status);

-- Migrate data: If 'received_at' exists, map it to 'claimed_at'
-- UPDATE user_rewards SET claimed_at = received_at, status = 'claimed' WHERE received_at IS NOT NULL;
-- ALTER TABLE user_rewards DROP COLUMN received_at;
