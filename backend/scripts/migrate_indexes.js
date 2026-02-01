const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function runMigration() {
  const migrationFile = path.join(__dirname, '../migrations/01_optimize_indexes.sql');
  console.log(`Reading migration file: ${migrationFile}`);
  
  try {
    const sqlContent = fs.readFileSync(migrationFile, 'utf8');
    // Split by semicolon, but handle comments roughly (SQL parser would be better but this is simple)
    // Actually, mysql2 can execute multiple statements if enabled, but let's try splitting manually for safety
    // or just run simpler commands. 
    // The driver config usually doesn't allow multiple statements unless 'multipleStatements: true'.
    // Let's split simple commands.
    
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute.`);

    const connection = await db.getConnection();
    
    try {
      for (const sql of statements) {
        if (sql.toUpperCase().startsWith('CREATE INDEX')) {
            console.log(`Executing: ${sql.substring(0, 50)}...`);
            try {
                await connection.query(sql);
                console.log('✅ Success');
            } catch (err) {
                if (err.code === 'ER_DUP_KEYNAME') {
                    console.log('⚠️ Index already exists, skipping.');
                } else {
                    console.error('❌ Failed:', err.message);
                }
            }
        }
      }
    } finally {
      connection.release();
    }
    
    console.log('Migration completed.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
      process.exit();
  }
}

runMigration();
