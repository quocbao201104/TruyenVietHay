const db = require("../config/db"); // Kết nối DB

exports.getCommentsByTruyen = async (truyenId, limit, offset) => {
  const [rows] = await db.query(
    `
      SELECT c.*, COALESCE(NULLIF(u.full_name, ''), u.username) AS author_name, u.avatar AS author_avatar
      FROM comments c
      JOIN users_new u ON c.user_id = u.id
      WHERE c.truyen_id = ? AND c.parent_id IS NULL
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
      `,
    [truyenId, limit, offset]
  );
  return rows;
};

exports.getReplies = async (parentId) => {
  const [rows] = await db.query(
    `
    SELECT c.*, COALESCE(NULLIF(u.full_name, ''), u.username) AS author_name, u.avatar AS author_avatar
    FROM comments c
    JOIN users_new u ON c.user_id = u.id
    WHERE c.parent_id = ? AND c.is_deleted = 0
    ORDER BY c.created_at ASC
    `,
    [parentId]
  );
  return rows;
};

exports.createComment = async (truyenId, userId, content, parentId = null) => {
  const [result] = await db.query(
    `INSERT INTO comments (truyen_id, user_id, content, parent_id, created_at) VALUES (?, ?, ?, ?, NOW())`,
    [truyenId, userId, content, parentId]
  );
  return result.insertId;
};

exports.softDeleteComment = async (commentId) => {
  const [result] = await db.query(
    `UPDATE comments SET is_deleted = TRUE WHERE id = ?`,
    [commentId]
  );
  return result.affectedRows;
};
