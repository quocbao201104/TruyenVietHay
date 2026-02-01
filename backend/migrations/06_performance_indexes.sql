-- =====================================================
-- Migration: Phase 2 - Database Performance
-- Date: 2026-02-01
-- =====================================================

-- C4: Add missing indexes for query performance
-- These indexes will significantly improve query speed for common operations

-- 1. User task lookups by user and status
CREATE INDEX idx_user_tasks_user_status 
ON user_tasks(user_id, status);

-- 2. User task completion lookups (composite for WHERE clauses)
CREATE INDEX idx_user_tasks_completion 
ON user_tasks(user_id, task_id, status);

-- 3. Level history queries ordered by date (covering index)
CREATE INDEX idx_user_levels_history_user_date 
ON user_levels_history(user_id, start_date DESC);

-- 4. User rewards by user ID
CREATE INDEX idx_user_rewards_user 
ON user_rewards(user_id);

-- 5. Task filtering by level
CREATE INDEX idx_tasks_level 
ON tasks(level_id);

-- =====================================================
-- H3: Remove redundant current_level_id from user_points
-- WARNING: This should only be run after testing!
-- Uncomment when ready to execute
-- =====================================================

-- Step 1: Verify all code uses user_levels_history instead
-- Step 2: Run this migration:
-- ALTER TABLE user_points DROP COLUMN current_level_id;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check all indexes were created:
-- SHOW INDEX FROM user_tasks;
-- SHOW INDEX FROM user_levels_history;
-- SHOW INDEX FROM user_rewards;
-- SHOW INDEX FROM tasks;

-- Test query performance:
-- EXPLAIN SELECT * FROM user_tasks WHERE user_id = 1 AND status = 'pending';
-- EXPLAIN SELECT * FROM user_levels_history WHERE user_id = 1 ORDER BY start_date DESC LIMIT 1;
