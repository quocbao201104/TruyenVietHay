const db = require('../config/db');

async function checkIndexes() {
  console.log('Checking indexes on truyen_new...');
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query("SHOW INDEX FROM truyen_new");
    console.table(rows);
    
    const ftIndex = rows.find(row => row.Index_type === 'FULLTEXT');
    if (ftIndex) {
        console.log('✅ FULLTEXT index found:', ftIndex.Key_name);
    } else {
        console.log('❌ NO FULLTEXT index found.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    connection.release();
    process.exit();
  }
}

checkIndexes();
