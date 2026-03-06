const db = require("../config/db");

// Tối ưu hàm cập nhật: Lấy dữ liệu 1 lần rồi update
const updateChuongMoiNhat = async (truyen_id) => {
  // Lấy cả chương mới nhất và tổng số chương trong 1 query
  const [[info]] = await db.query(
    `SELECT 
        (SELECT so_chuong FROM chuong WHERE truyen_id = ? AND is_chuong_mau = 0 AND trang_thai = 'da_duyet' ORDER BY so_chuong DESC LIMIT 1) as max_so,
        COUNT(*) as tong_so
     FROM chuong 
     WHERE truyen_id = ? AND is_chuong_mau = 0 AND trang_thai = 'da_duyet'`,
    [truyen_id, truyen_id]
  );

  const chuongMoiString = info.max_so ? `Chương ${info.max_so}` : "Hiện tại chưa có chương tương ứng";

  await db.query(
    `UPDATE truyen_new SET chuong_moi = ?, so_luong_chuong = ? WHERE id = ?`,
    [chuongMoiString, info.tong_so, truyen_id]
  );
};

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
      `SELECT id, truyen_id, so_chuong, tieu_de, slug, thoi_gian_dang, luot_xem
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
      `SELECT id, truyen_id, so_chuong, tieu_de, slug, thoi_gian_dang, trang_thai, ly_do_tu_choi, luot_xem
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
    // Tối ưu: Dùng so_chuong để điều hướng thay vì id
    const query = `
      SELECT 
        c.*, 
        t.ten_truyen, 
        t.slug as truyen_slug,
        (SELECT slug FROM chuong WHERE truyen_id = c.truyen_id AND so_chuong < c.so_chuong AND trang_thai = 'da_duyet' ORDER BY so_chuong DESC LIMIT 1) as prev_chapter_slug,
        (SELECT slug FROM chuong WHERE truyen_id = c.truyen_id AND so_chuong > c.so_chuong AND trang_thai = 'da_duyet' ORDER BY so_chuong ASC LIMIT 1) as next_chapter_slug
      FROM chuong c 
      JOIN truyen_new t ON c.truyen_id = t.id 
      WHERE c.slug = ? AND t.slug = ? 
      AND c.trang_thai = 'da_duyet'
      LIMIT 1
    `;

    const [rows] = await db.execute(query, [chapterSlug, storySlug]);
    
    if (rows.length > 0) {
        const row = rows[0];
        return {
            ...row,
            truyen: { id: row.truyen_id, ten_truyen: row.ten_truyen, slug: row.truyen_slug },
            navigation: {
                prev_slug: row.prev_chapter_slug || null,
                next_slug: row.next_chapter_slug || null
            }
        };
    }
    return null;
  },

  updateChapter: async (id, { tieu_de, noi_dung, so_chuong, slug }) => {
    // Need truyen_id to update chuong_moi if needed
    const [chapter] = await db.query(`SELECT truyen_id, trang_thai FROM chuong WHERE id = ?`, [id]);
    
    const [result] = await db.execute(
      `UPDATE chuong 
        SET tieu_de = ?, noi_dung = ?, so_chuong = ?, slug = ? 
        WHERE id = ?`,
      [tieu_de, noi_dung, so_chuong, slug, id]
    );
    
    if (chapter && chapter.length > 0 && chapter[0].trang_thai === 'da_duyet') {
      await updateChuongMoiNhat(chapter[0].truyen_id);
    }
    
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
         await updateChuongMoiNhat(truyenId);
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
    const connection = await db.getConnection(); // Sử dụng connection để dùng Transaction
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `UPDATE chuong SET trang_thai = 'da_duyet' WHERE truyen_id = ? AND is_chuong_mau = 0`,
        [truyen_id]
      );

      if (result.affectedRows > 0) {
        await connection.query("UPDATE truyen_new SET thoi_gian_cap_nhat = NOW() WHERE id = ?", [truyen_id]);
        
        // Gọi hàm update count bên trong transaction này luôn
        // Lưu ý: Cần viết lại hàm updateChuongMoiNhat để nhận connection nếu muốn tối ưu tuyệt đối
        await updateChuongMoiNhat(truyen_id); 
      }

      await connection.commit();
      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = ChapterModel;