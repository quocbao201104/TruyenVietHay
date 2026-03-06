// backend/models/user.model.js
const db = require("../config/db");

const UserModel = {
    getTotalUsersCount: async () => {
        const [rows] = await db.query(`SELECT COUNT(*) as count FROM users_new`);
        return rows[0].count;
    },
    getActiveUsersCount: async () => {
        const [rows] = await db.query(`SELECT COUNT(*) as count FROM users_new WHERE status = 'active'`);
        return rows[0].count;
    },
    getBlockedUsersCount: async () => {
        const [rows] = await db.query(`SELECT COUNT(*) as count FROM users_new WHERE status = 'blocked'`);
        return rows[0].count;
    },
    getAuthorUsersCount: async () => {
        const [rows] = await db.query(`SELECT COUNT(*) as count FROM users_new WHERE role = 'author'`);
        return rows[0].count;
    },
    updateUserRole: async (userId, newRole) => {
        const [result] = await db.query(
            `UPDATE users_new SET role = ? WHERE id = ?`,
            [newRole, userId]
        );
        return result.affectedRows;
    },

    findByUsername: async (username) => {
        const [rows] = await db.query(
            "SELECT id, username, password, email, full_name, phone, avatar, role, gender, created_at, status, ban_until FROM users_new WHERE username = ?",
            [username]
        );
        return rows;
    },

    create: async (userData) => {
        const avatar = userData.avatar || null;
        const sql = `
            INSERT INTO users_new (username, password, email, full_name, phone, role, avatar, gender, google_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            userData.username,
            userData.password,
            userData.email,
            userData.full_name,
            userData.phone,
            userData.role || "user",
            avatar,
            userData.gender || "other",
            userData.google_id || null
        ];
        const [result] = await db.query(sql, values);
        return result;
    },

    findById: async (id) => {
        const [rows] = await db.query(
            `
            SELECT id, username, password, email, full_name, phone, avatar, role, gender, created_at, status, ban_until
            FROM users_new WHERE id = ?
        `,
            [id]
        );
        return rows;
    },

    findByEmail: async (email) => {
        const [rows] = await db.query("SELECT * FROM users_new WHERE email = ?", [
            email,
        ]);
        return rows;
    },

    findByGoogleId: async (googleId) => {
        const [rows] = await db.query("SELECT * FROM users_new WHERE google_id = ?", [
            googleId,
        ]);
        return rows;
    },

    linkGoogleAccount: async (userId, googleId) => {
        const [result] = await db.query(
            "UPDATE users_new SET google_id = ? WHERE id = ?",
            [googleId, userId]
        );
        return result.affectedRows;
    },

    updatePassword: async (id, hashedPassword) => {
        try {
            const [result] = await db.execute("UPDATE users_new SET password = ? WHERE id = ?", [
                hashedPassword,
                id,
            ]);
            return result.affectedRows;
        } catch (dbError) {
            throw dbError;
        }
    },

    updateUser: async (id, updatedData) => {
        const fields = [];
        const values = [];

        if (updatedData.full_name !== undefined) {
            fields.push("full_name = ?");
            values.push(updatedData.full_name);
        }
        if (updatedData.email !== undefined) {
            fields.push("email = ?");
            values.push(updatedData.email);
        }
        if (updatedData.phone !== undefined) {
            fields.push("phone = ?");
            values.push(updatedData.phone);
        }
        if (updatedData.gender !== undefined) {
            fields.push("gender = ?");
            values.push(updatedData.gender);
        }
        if (Object.prototype.hasOwnProperty.call(updatedData, 'avatar')) {
            fields.push("avatar = ?");
            values.push(updatedData.avatar);
        }

        if (fields.length === 0) {
            return 0;
        }

        values.push(id);
        const sql = `UPDATE users_new SET ${fields.join(", ")} WHERE id = ?`;

        try {
            const [result] = await db.query(sql, values);
            return result.affectedRows;
        } catch (dbError) {
            throw dbError;
        }
    },

    updateStatus: async (userId, status, banUntil) => {
        const [result] = await db.query(
            `UPDATE users_new SET status = ?, ban_until = ? WHERE id = ?`,
            [status, banUntil, userId]
        );
        return result.affectedRows;
    },

    findAllUsers: async (search = '', limit = 10, offset = 0, role = '', status = '', sortBy = 'created_at', sortOrder = 'DESC') => {
        let sql = `SELECT id, username, role, status, ban_until, full_name, email, phone, created_at FROM users_new WHERE 1=1`;
        let countSql = `SELECT COUNT(*) as total FROM users_new WHERE 1=1`;
        const params = [];
        const countParams = [];

        if (search) {
            sql += ` AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)`;
            countSql += ` AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (role) {
            sql += ` AND role = ?`;
            countSql += ` AND role = ?`;
            params.push(role);
            countParams.push(role);
        }

        if (status) {
            sql += ` AND status = ?`;
            countSql += ` AND status = ?`;
            params.push(status);
            countParams.push(status);
        }

        // Thêm sắp xếp
        const validSortColumns = ['id', 'username', 'email', 'full_name', 'role', 'status', 'created_at'];
        const validSortOrder = ['asc', 'desc', 'ASC', 'DESC']; 

        const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const finalSortOrder = validSortOrder.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

        sql += ` ORDER BY ${finalSortBy} ${finalSortOrder} LIMIT ? OFFSET ?`; 
        params.push(parseInt(limit), parseInt(offset));

        const [users] = await db.query(sql, params);
        const [totalRows] = await db.query(countSql, countParams);
        const total = totalRows[0].total;

        return { users, total };
    },

    deleteById: async (id) => {
        const [result] = await db.query(`DELETE FROM users_new WHERE id = ?`, [id]);
        return result.affectedRows;
    },
};

module.exports = UserModel;