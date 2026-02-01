const db = require('../config/db');

async function migrateCategoryIndexes() {
  console.log('🚀 Adding Category Indexes...');
  const connection = await db.getConnection();

  try {
    const queries = [
        "CREATE INDEX idx_truyen_theloai_reverse ON truyen_theloai(theloai_id, truyen_id)",
        "CREATE INDEX idx_truyen_theloai_forward ON truyen_theloai(truyen_id, theloai_id)"
    ];

    for (const query of queries) {
        try {
            await connection.query(query);
            console.log(`✅ Executed: ${query}`);
        } catch (err) {
            if (err.code === 'ER_DUP_KEYNAME') {
                console.log(`⚠️ Index already exists (skipped): ${query.split('ON')[0]}`);
            } else {
                console.error(`❌ Failed: ${query}`, err.message);
            }
        }
    }
    console.log('Category Index Migration Complete.');
  } catch (error) {
    console.error('❌ Script error:', error);
  } finally {
    connection.release();
    process.exit();
  }
}

migrateCategoryIndexes();
