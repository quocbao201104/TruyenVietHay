const db = require("../config/db");
// models/follow.model.js

exports.toggleFollow = async (userId, truyenId) => {
  const [rows] = await db.query(
    `SELECT * FROM theo_doi WHERE user_id = ? AND truyen_id = ?`,
    [userId, truyenId]
  );

  if (rows.length > 0) {
    await db.query(`DELETE FROM theo_doi WHERE user_id = ? AND truyen_id = ?`, [
      userId,
      truyenId,
    ]);
    return { followed: false };
  } else {
    await db.query(
      `INSERT INTO theo_doi (user_id, truyen_id, ngay_theo_doi) VALUES (?, ?, NOW())`,
      [userId, truyenId]
    );
    return { followed: true };
  }
};

// Lấy danh sách truyện theo dõi với phân trang
exports.getFollowedStories = (userId, offset, limit) => {
  return db.query(
    `
    SELECT 
      t.id, 
      t.ten_truyen, 
      t.slug,
      t.tac_gia,
      t.anh_bia, 
      t.trang_thai,
      t.luot_xem, 
      t.luot_thich, 
      t.luot_theo_doi,
      t.thoi_gian_cap_nhat,
      t.so_luong_chuong AS so_chuong,
      td.ngay_theo_doi
    FROM truyen_new t
    JOIN theo_doi td ON t.id = td.truyen_id
    WHERE td.user_id = ?
    ORDER BY td.ngay_theo_doi DESC
    LIMIT ? OFFSET ?
  `,
    [userId, limit, offset]
  );
};

// Lấy tổng số truyện đang theo dõi của user
exports.getFollowCount = (userId) => {
  return db.query(
    `
    SELECT COUNT(*) as count
    FROM theo_doi td
    WHERE td.user_id = ?
  `,
    [userId]
  );
};

// Kiểm tra xem user đã theo dõi truyện chưa
exports.isFollowing = (userId, truyenId) => {
  return db.query(
    `
    SELECT 1 FROM theo_doi td WHERE td.user_id = ? AND td.truyen_id = ?
  `,
    [userId, truyenId]
  );
};

// Thêm truyện vào danh sách theo dõi
exports.addFollow = (userId, truyenId) => {
  return db.query(
    `
    INSERT INTO theo_doi (user_id, truyen_id, ngay_theo_doi) VALUES (?, ?, NOW())
  `,
    [userId, truyenId]
  );
};

// Xóa truyện khỏi danh sách theo dõi
exports.removeFollow = (userId, truyenId) => {
  return db.query(
    `
    DELETE FROM theo_doi WHERE user_id = ? AND truyen_id = ?
  `,
    [userId, truyenId]
  );
};
