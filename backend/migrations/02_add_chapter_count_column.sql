-- Migration: Add chapter count column to stories
-- Purpose: Denormalize chapter counts to avoid expensive COUNT(*) subqueries
ALTER TABLE truyen_new ADD COLUMN so_luong_chuong INT DEFAULT 0;
CREATE INDEX idx_story_chapter_count ON truyen_new(so_luong_chuong);
