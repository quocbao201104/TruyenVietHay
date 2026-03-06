// backend/models/authorApplication.model.js
const db = require("../config/db");

const AuthorApplicationModel = {
    create: async (data) => {
        const sql = `
            INSERT INTO author_applications (user_id, pen_name, bio, experience, status)
            VALUES (?, ?, ?, ?, 'pending')
        `;
        const values = [data.user_id, data.pen_name, data.bio, data.experience];
        const [result] = await db.query(sql, values);
        return result.insertId;
    },

    findPendingByUserId: async (userId) => {
        const [rows] = await db.query(
            "SELECT * FROM author_applications WHERE user_id = ? AND status = 'pending'",
            [userId]
        );
        return rows;
    },

    findLatestByUserId: async (userId) => {
        const [rows] = await db.query(
            "SELECT * FROM author_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
            [userId]
        );
        return rows[0];
    },

    findById: async (id) => {
        const [rows] = await db.query(
            "SELECT * FROM author_applications WHERE id = ?",
            [id]
        );
        return rows[0];
    },

    updateStatus: async (id, status, adminNote = null) => {
        const [result] = await db.query(
            "UPDATE author_applications SET status = ?, admin_note = ? WHERE id = ?",
            [status, adminNote, id]
        );
        return result.affectedRows;
    },

    findAll: async (status = null) => {
        let sql = "SELECT * FROM author_applications";
        const params = [];
        if (status) {
            sql += " WHERE status = ?";
            params.push(status);
        }
        sql += " ORDER BY created_at DESC";
        const [rows] = await db.query(sql, params);
        return rows;
    }
};

module.exports = AuthorApplicationModel;
