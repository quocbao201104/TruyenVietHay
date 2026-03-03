const db = require('./config/db');

(async () => {
  try {
    console.log('\n=== KIỂM TRA SCHEMA PRODUCTION ===\n');

    // 1. Kiểm tra bảng thong_bao
    console.log('--- Bảng thong_bao ---');
    const [thongBaoCols] = await db.query('DESCRIBE thong_bao');
    console.log(thongBaoCols.map(c => `${c.Field} (${c.Type})`).join('\n'));

    // 2. Kiểm tra các cột quan trọng của truyen_new
    console.log('\n--- Bảng truyen_new (chỉ cột quan trọng) ---');
    const [truyenCols] = await db.query('DESCRIBE truyen_new');
    const important = ['hot_score', 'luot_thich', 'luot_theo_doi', 'rating', 'rating_count', 'chuong_moi', 'age_rating'];
    const found = truyenCols.filter(c => important.includes(c.Field));
    const missing = important.filter(name => !truyenCols.find(c => c.Field === name));
    console.log('✅ Có:', found.map(c => c.Field).join(', '));
    if (missing.length) console.log('❌ THIẾU:', missing.join(', '));

    process.exit(0);
  } catch (error) {
    console.error('LỖI:', error.message);
    process.exit(1);
  }
})();
