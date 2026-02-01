const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Starting Full Text Index Migration...');
  
  try {
    const sqlPath = path.join(__dirname, '../migrations/03_add_fulltext_index.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split commands if necessary, but here it's likely one command.
    // However, the file content might be just the SQL.
    // Clean up comments for execution if needed, but db.query usually handles them or we act carefully.
    
    // We'll extract the ALTER statements.
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    const connection = await db.getConnection();
    
    try {
        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            await connection.query(statement);
        }
        console.log('✅ Full Text Index created successfully!');
    } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
            console.log('⚠️ Index already exists. Skipping.');
        } else {
            console.error('❌ Migration failed:', err.message);
        }
    } finally {
        connection.release();
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  } finally {
    process.exit();
  }
}

runMigration();
