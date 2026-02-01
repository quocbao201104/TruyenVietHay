-- Migration: Add FULLTEXT index for Search Optimization
-- Purpose: Replace slow LIKE '%...%' queries with fast MATCH(...) AGAINST(...)
-- Note: 'ngram' parser provides better support for Asian languages (Vietnamese) if available.
-- If 'ngram' is not supported on the specific MySQL version, it falls back to default.

-- Check if index exists first (logic handled in application or usually manually)
-- but for raw SQL we just try to create it.

ALTER TABLE truyen_new ADD FULLTEXT INDEX idx_fulltext_search (ten_truyen, tac_gia) WITH PARSER ngram;
