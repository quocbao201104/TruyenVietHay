const db = require('../config/db');

async function checkIndexes() {
  try {
    const connection = await db.getConnection();
    const tables = ['truyen_new', 'comments', 'lich_su_doc_new', 'chuong'];
    
    console.log('Checking indexes...');
    
    for (const table of tables) {
      const [rows] = await connection.query(`SHOW INDEX FROM ${table}`);
      console.log(`\nTable: ${table}`);
      const indexes = {};
      rows.forEach(row => {
        if (!indexes[row.Key_name]) indexes[row.Key_name] = [];
        indexes[row.Key_name].push(row.Column_name);
      });
      
      Object.keys(indexes).forEach(key => {
        console.log(`  - ${key}: [${indexes[key].join(', ')}]`);
      });
    }
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Check failed:', error);
    process.exit(1);
  }
}

checkIndexes();
