const db = require('../config/db');

async function backfillChapterCounts() {
  console.log('🚀 Starting backfill of chapter counts...');
  const connection = await db.getConnection();

  try {
    // 1. Add column if not exists (Handling it here safely since we can't run the SQL file easily via CLI)
    try {
        console.log('Checking if column exists...');
        await connection.query('SELECT so_luong_chuong FROM truyen_new LIMIT 1');
        console.log('✅ Column so_luong_chuong already exists.');
    } catch (err) {
        if (err.code === 'ER_BAD_FIELD_ERROR') {
            console.log('⚠️ Column missing. Adding it now...');
            await connection.query('ALTER TABLE truyen_new ADD COLUMN so_luong_chuong INT DEFAULT 0');
            await connection.query('CREATE INDEX idx_story_chapter_count ON truyen_new(so_luong_chuong)');
            console.log('✅ Column added.');
        } else {
            throw err;
        }
    }

    // 2. Calculate counts and update
    console.log('Updating counts...');
    
    // Efficient multi-table update
    // We count only "Approved" chapters (trang_thai = 'da_duyet') because that's what public users see
    const updateQuery = `
        UPDATE truyen_new t
        JOIN (
            SELECT truyen_id, COUNT(*) as count 
            FROM chuong 
            WHERE trang_thai = 'da_duyet'
            GROUP BY truyen_id
        ) c ON t.id = c.truyen_id
        SET t.so_luong_chuong = c.count;
    `;
    
    const [result] = await connection.query(updateQuery);
    console.log(`✅ Updated ${result.affectedRows} stories with correct chapter counts.`);
    
    // 3. Set remaining specific cases (0 chapters) if needed
    // The JOIN update only updates stories that have at least one approved chapter.
    // Stories with 0 approved chapters already have default 0 if column was just created.
    
    console.log('Backfill complete!');
  } catch (error) {
    console.error('❌ Error during backfill:', error);
  } finally {
    connection.release();
    process.exit();
  }
}

backfillChapterCounts();
