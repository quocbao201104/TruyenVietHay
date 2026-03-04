-- =============================================================================
-- Migration: Bảng daily_stats - Time-Series cho biểu đồ Dashboard
-- =============================================================================
-- Mục đích: Lưu thống kê theo ngày (views, comments) per novel để vẽ biểu đồ
-- Nguồn dữ liệu: truyen_views (lượt xem theo ngày), comments (bình luận theo ngày)
-- Cronjob cuối ngày sẽ INSERT/UPDATE dữ liệu từ 2 bảng nguồn vào đây
-- =============================================================================

CREATE TABLE IF NOT EXISTS daily_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  novel_id INT NOT NULL,
  date DATE NOT NULL COMMENT 'Ngày thống kê (chuẩn DATE)',
  views_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  UNIQUE KEY unique_novel_date (novel_id, date),
  INDEX idx_daily_stats_date (date),
  INDEX idx_daily_stats_novel_date (novel_id, date),
  FOREIGN KEY (novel_id) REFERENCES truyen_new(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
