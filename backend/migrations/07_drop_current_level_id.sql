-- =====================================================
-- Migration: Phase 2 - Drop Redundant current_level_id
-- Date: 2026-02-01
-- IMPORTANT: Run this ONLY after verifying code changes work
-- =====================================================

-- H3: Remove redundant current_level_id column from user_points
-- The user_levels_history table is now the single source of truth for user levels

-- Before running, verify:
-- 1. All code has been updated to use user_levels_history
-- 2. Server has been restarted and tested
-- 3. No errors in production logs

ALTER TABLE user_points DROP COLUMN current_level_id;

-- Verification:
-- DESCRIBE user_points;
-- Expected columns: user_id, total_points, expiry_date

-- If you need to rollback (NOT recommended):
-- ALTER TABLE user_points ADD COLUMN current_level_id INT AFTER total_points;
