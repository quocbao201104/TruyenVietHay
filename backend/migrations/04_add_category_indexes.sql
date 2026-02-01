-- Migration: Add indexes for Category/Genre Filtering
-- Purpose: Optimize queries that filter stories by genre (theloai_id)

-- 1. Optimize "Story has Genre" lookup (Used in filterByGenreIds: WHERE theloai_id IN (...))
CREATE INDEX idx_truyen_theloai_reverse ON truyen_theloai(theloai_id, truyen_id);

-- 2. Optimize "Get Genres of Story" (Used in Story Detail: WHERE truyen_id = ?)
-- Note: Assuming truyen_id is part of PK, but if not, this is needed.
-- If PK is (truyen_id, theloai_id), this is redundant for the first column, but good to be sure.
-- Checking schema would be best, but creating this index is safe optimization priority.
CREATE INDEX idx_truyen_theloai_forward ON truyen_theloai(truyen_id, theloai_id);
