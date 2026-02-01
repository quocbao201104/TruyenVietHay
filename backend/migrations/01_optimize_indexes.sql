-- Database Performance Optimization Migration
-- Created: 2026-02-01
-- Purpose: Add missing composite indexes for critical queries

-- 1. Optimize Homepage Sorting & Filtering
-- Query: ORDER BY trang_thai_kiem_duyet, thoi_gian_cap_nhat DESC
CREATE INDEX idx_truyen_status_updated ON truyen_new(trang_thai_kiem_duyet, thoi_gian_cap_nhat);

-- Query: ORDER BY trang_thai_kiem_duyet, luot_xem DESC
CREATE INDEX idx_truyen_status_views ON truyen_new(trang_thai_kiem_duyet, luot_xem);

-- 2. Optimize Comment Fetching
-- Query: WHERE truyen_id = ? AND parent_id IS NULL ORDER BY created_at DESC
CREATE INDEX idx_comments_story_parent_created ON comments(truyen_id, parent_id, created_at);

-- 3. Optimize Reading History
-- Query: WHERE user_id = ? AND truyen_id = ? ... ORDER BY thoi_gian_doc
CREATE INDEX idx_history_user_story_time ON lich_su_doc_new(user_id, truyen_id, thoi_gian_doc);

-- 4. Optimize Chapter Listing
-- Query: WHERE truyen_id = ? AND is_chuong_mau = 0 AND trang_thai = 'da_duyet' ORDER BY so_chuong
CREATE INDEX idx_chapter_story_status_number ON chuong(truyen_id, is_chuong_mau, trang_thai, so_chuong);

-- 5. Text Search Optimization (Optional - requires table rebuild on some engines)
-- ALTER TABLE truyen_new ADD FULLTEXT INDEX idx_fulltext_search (ten_truyen, tac_gia);
