-- =====================================================
-- Migration: Gamification System Critical Fixes
-- Phase 1: Security & Data Integrity
-- Date: 2026-02-01
-- =====================================================

-- C1: Add unique constraint to prevent duplicate task assignments
-- This prevents users from being assigned the same task multiple times
ALTER TABLE user_tasks 
ADD UNIQUE INDEX idx_user_task_unique (user_id, task_id);

-- H1: Add foreign key constraints for referential integrity
-- Only add if constraints don't already exist
ALTER TABLE user_tasks 
ADD CONSTRAINT fk_user_tasks_task 
FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE;

-- H14: Add pre-assignment check is handled in application code
-- but we ensure the unique constraint above prevents duplicates

-- Note: The following are handled in application code, not database:
-- - C2: Transaction wrapping for task completion
-- - C3: Transaction wrapping for level upgrade
-- - C6: Point validation (GREATEST function in SQL)
-- - C7/C9: Authorization checks
-- - H4: Reward eligibility checks
-- - H15: Column name fixes in code

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these after migration to verify:

-- 1. Check unique constraint exists:
-- SHOW INDEX FROM user_tasks WHERE Key_name = 'idx_user_task_unique';

-- 2. Check foreign key exists:
-- SELECT * FROM information_schema.KEY_COLUMN_USAGE 
-- WHERE TABLE_NAME = 'user_tasks' AND CONSTRAINT_NAME = 'fk_user_tasks_task';
