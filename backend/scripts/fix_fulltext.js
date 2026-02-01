const db = require('../config/db');

async function fixFullText() {
  console.log('🔧 Fixing Full Text Index...');
  const connection = await db.getConnection();
  
  try {
    // 1. Check if exists (simplified)
    const [rows] = await connection.query("SHOW INDEX FROM truyen_new WHERE Key_name = 'idx_fulltext_search'");
    if (rows.length > 0) {
        console.log('⚠️ Index idx_fulltext_search already exists. Dropping to recreate...');
        await connection.query("DROP INDEX idx_fulltext_search ON truyen_new");
    }

    // 2. Create Index
    // Note: Using 'ngram' parser for Vietnamese support.
    const sql = "ALTER TABLE truyen_new ADD FULLTEXT INDEX idx_fulltext_search (ten_truyen, tac_gia) WITH PARSER ngram";
    console.log('EXECUTING:', sql);
    await connection.query(sql);
    
    console.log('✅ FULLTEXT index created successfully!');

    // 3. Verify
    const [verify] = await connection.query("SHOW INDEX FROM truyen_new WHERE Key_name = 'idx_fulltext_search'");
    if (verify.length > 0) {
        console.log('🔍 Verification: Index Found!');
        console.table(verify);
    } else {
        console.error('❌ Verification Failed: Index still missing.');
    }

  } catch (err) {
    console.error('❌ Error creating index:', err);
  } finally {
    connection.release();
    process.exit();
  }
}

fixFullText();
