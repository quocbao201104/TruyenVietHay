const db = require("../config/db");

const ChapterModel = {
  createChapter: async ({ truyen_id, so_chuong, tieu_de, noi_dung, slug }) => {
    const thoi_gian_dang = new Date();
    const [result] = await db.execute(
      `INSERT INTO chuong (
        truyen_id, so_chuong, tieu_de, noi_dung, slug,
        thoi_gian_dang, trang_thai, is_chuong_mau
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        truyen_id,
        so_chuong,
        tieu_de,
        noi_dung, // <-- Sử dụng cột noi_dung cho chương bình thường
        slug,
        thoi_gian_dang,
        "cho_duyet", 
        0, 
      ]
    );
    return { chapter_id: result.insertId };
  },

  getChaptersByStoryId: async (truyen_id, limit, offset) => {
    const [rows] = await db.query(
      `SELECT id, truyen_id, so_chuong, tieu_de, slug, thoi_gian_dang
        FROM chuong 
        WHERE truyen_id = ? AND is_chuong_mau = 0 AND trang_thai = 'da_duyet'
        ORDER BY so_chuong ASC
        LIMIT ? OFFSET ?`,
      [truyen_id, limit, offset]
    );
    return rows;
  },

  getAdminChaptersByStoryId: async (truyen_id, limit, offset) => {
    const [rows] = await db.query(
      `SELECT id, truyen_id, so_chuong, tieu_de, slug, thoi_gian_dang, trang_thai
        FROM chuong 
        WHERE truyen_id = ? AND is_chuong_mau = 0
        ORDER BY so_chuong ASC
        LIMIT ? OFFSET ?`,
      [truyen_id, limit, offset]
    );
    return rows;
  },

  getChapterById: async (chapter_id) => {
    const [rows] = await db.execute(`SELECT * FROM chuong WHERE id = ?`, [
      chapter_id,
    ]);
    return rows[0];
  },

  getChapterBySlug: async (chapterSlug, storySlug) => {
    const [rows] = await db.execute(
      `SELECT c.*, t.ten_truyen, t.slug as truyen_slug 
       FROM chuong c 
       JOIN truyen_new t ON c.truyen_id = t.id 
       WHERE c.slug = ? AND t.slug = ? LIMIT 1`,
      [chapterSlug, storySlug]
    );
    if (rows.length > 0) {
        const row = rows[0];
        // Format to match the frontend expectation of chapter.truyen.slug
        return {
            ...row,
            truyen: {
                id: row.truyen_id,
                ten_truyen: row.ten_truyen,
                slug: row.truyen_slug
            }
        };
    }
    return null;
  },

  updateChapter: async (id, { tieu_de, noi_dung, so_chuong, slug }) => {
    const [result] = await db.execute(
      `UPDATE chuong 
        SET tieu_de = ?, noi_dung = ?, so_chuong = ?, slug = ? 
        WHERE id = ?`,
      [tieu_de, noi_dung, so_chuong, slug, id]
    );
    return result.affectedRows;
  },

  deleteChapter: async (id) => {
    // Get truyen_id before deleting to update count later
    const [chapter] = await db.query(`SELECT truyen_id, trang_thai FROM chuong WHERE id = ?`, [id]);
    if (!chapter || chapter.length === 0) return 0;
    
    const truyenId = chapter[0].truyen_id;
    const isApproved = chapter[0].trang_thai === 'da_duyet';

    const [result] = await db.execute(`DELETE FROM chuong WHERE id = ?`, [id]);
    
    // Update count if an approved chapter was deleted
    if (result.affectedRows > 0 && isApproved) {
         await db.query(`
            UPDATE truyen_new 
            SET so_luong_chuong = so_luong_chuong - 1 
            WHERE id = ?`, 
            [truyenId]
        );
    }
    return result.affectedRows;
  },

  createSampleChapter: async (chapterData) => {
    await db.query(
      `INSERT INTO chuong (
        truyen_id, so_chuong, tieu_de, noi_dung, noi_dung_chuong_mau,
        thoi_gian_dang, trang_thai, is_chuong_mau
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        chapterData.truyen_id,
        0, // Chương mẫu thường có số chương là 0 hoặc một giá trị đặc biệt
        "Chương mẫu",
        chapterData.noi_dung, // <-- Satisfy NOT NULL constraint for noi_dung
        chapterData.noi_dung, // <-- Also save to noi_dung_chuong_mau
        chapterData.thoi_gian_dang,
        "chuong_mau", // Trạng thái đặc biệt cho chương mẫu
        1, // Đánh dấu đây là chương mẫu
      ]
    );
  },

  approveAllChapters: async (truyen_id) => {
    const [result] = await db.execute(
      `UPDATE chuong SET trang_thai = 'da_duyet' WHERE truyen_id = ? AND is_chuong_mau = 0`,
      [truyen_id]
    );

    // 1. Update story timestamp
    if (result.affectedRows > 0) {
        await db.query("UPDATE truyen_new SET thoi_gian_cap_nhat = NOW() WHERE id = ?", [truyen_id]);
        
        // 2. Update chapter count
        // Recalculate to be safe and accurate
        await db.query(`
            UPDATE truyen_new t
            SET so_luong_chuong = (
                SELECT COUNT(*) FROM chuong WHERE truyen_id = ? AND trang_thai = 'da_duyet'
            )
            WHERE id = ?
        `, [truyen_id, truyen_id]);
    }
    
    return result.affectedRows;
  },
};

module.exports = ChapterModel;