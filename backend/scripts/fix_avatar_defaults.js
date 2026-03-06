const db = require('../config/db');
(async () => {
  try {
    console.log('--- STARTING AVATAR CLEANUP ---');
    
    // 1. Alter table to set default to NULL
    console.log('1. Setting avatar column default to NULL...');
    await db.query(`ALTER TABLE users_new ALTER COLUMN avatar SET DEFAULT NULL`);
    
    // 2. Update existing records to NULL if they match old defaults
    console.log('2. Updating existing records to NULL...');
    const oldDefaults = [
      '/uploads_img/avatar/default-avatar.jpg',
      'uploads_img/avatar/default-avatar.jpg',
      'anh/avatar-default.jpg',
      '/anh/avatar-default.jpg'
    ];
    
    const [result] = await db.query(
      `UPDATE users_new SET avatar = NULL WHERE avatar IN (?, ?, ?, ?)`,
      oldDefaults
    );
    
    console.log(`Updated ${result.affectedRows} users.`);
    console.log('--- CLEANUP COMPLETE ---');
    process.exit(0);
  } catch (err) {
    console.error('FAILED TO CLEANUP:', err.message);
    process.exit(1);
  }
})();
