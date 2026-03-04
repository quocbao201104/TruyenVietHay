-- Migration: Thêm cột luot_xem vào bảng chuong cho View Tracking System
-- Chạy migration này trước khi sử dụng View Sync Cronjob

ALTER TABLE chuong ADD COLUMN luot_xem INT DEFAULT 0;

CREATE INDEX idx_chuong_luot_xem ON chuong(luot_xem);
