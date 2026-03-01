-- Migration: Add google_id to users_new table
ALTER TABLE users_new
ADD COLUMN google_id VARCHAR(255) NULL UNIQUE AFTER email,
ADD INDEX idx_google_id (google_id);
