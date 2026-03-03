const db = require("../config/db");

const NotificationController = {
  // Get notifications for the logged-in user
  getNotifications: async (req, res) => {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const [notifications] = await db.query(
        `SELECT id, user_id, content, is_read, type, target_id, created_at
         FROM thong_bao 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );

      const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM thong_bao WHERE user_id = ?`,
        [userId]
      );
      
      const [unreadResult] = await db.query(
        `SELECT COUNT(*) as unread FROM thong_bao WHERE user_id = ? AND is_read = 0`,
        [userId]
      );

      res.status(200).json({
        success: true,
        data: notifications,
        pagination: {
          total: countResult[0].total,
          page,
          limit,
          totalPages: Math.ceil(countResult[0].total / limit),
        },
        unreadCount: unreadResult[0].unread
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Lỗi khi lấy thông báo", error: error.message });
    }
  },

  // Mark a single notification as read
  markAsRead: async (req, res) => {
    try {
      const userId = req.user.id;
      const notificationId = req.params.id;

      // Access control: only mark own notifications
      const [rows] = await db.query(
        `SELECT id FROM thong_bao WHERE id = ? AND user_id = ?`,
        [notificationId, userId]
      );

      if (rows.length === 0) {
        return res.status(403).json({ message: "Không có quyền truy cập thông báo này" });
      }

      await db.query(
        `UPDATE thong_bao SET is_read = 1 WHERE id = ? AND user_id = ?`,
        [notificationId, userId]
      );

      res.status(200).json({ success: true, message: "Đã đánh dấu đã đọc" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Lỗi khi cập nhật trạng thái", error: error.message });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.id;

      await db.query(
        `UPDATE thong_bao SET is_read = 1 WHERE user_id = ? AND is_read = 0`,
        [userId]
      );

      res.status(200).json({ success: true, message: "Đã đánh dấu tất cả là đã đọc" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Lỗi khi cập nhật trạng thái", error: error.message });
    }
  }
};

module.exports = NotificationController;
