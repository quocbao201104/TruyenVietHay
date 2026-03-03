const db = require('./backend/config/db');

async function syncChuongMoi() {
  try {
    const [truyenList] = await db.query('SELECT id FROM truyen_new');
    let updatedCount = 0;
    
    for (const truyen of truyenList) {
        const [latestChuong] = await db.query(
            `SELECT so_chuong
             FROM chuong 
             WHERE truyen_id = ? AND is_chuong_mau = 0 AND trang_thai = 'da_duyet'
             ORDER BY so_chuong DESC LIMIT 1`,
            [truyen.id]
        );
        
        // Changed to use newest so_chuong exactly as user requested!
        let chuongMoiString = "Hiện tại chưa có chương tương ứng";
        if (latestChuong.length > 0) {
            chuongMoiString = `Chương ${latestChuong[0].so_chuong}`;
        }
        
        const [result] = await db.query(`
            UPDATE truyen_new 
            SET 
                chuong_moi = ?, 
                so_luong_chuong = (SELECT COUNT(*) FROM chuong WHERE truyen_id = ? AND is_chuong_mau = 0 AND trang_thai = 'da_duyet')
            WHERE id = ?`, 
            [chuongMoiString, truyen.id, truyen.id]
        );
        if (result.affectedRows > 0) updatedCount++;
    }
    
    console.log(`Updated chuong_moi logic for ${updatedCount} stories!`);
    process.exit(0);
  } catch (error) {
    console.error("Error updating chuong_moi logic:", error);
    process.exit(1);
  }
}

syncChuongMoi();
