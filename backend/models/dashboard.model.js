/**
 * Dashboard Model
 *
 * Các query phục vụ Author Dashboard và Admin Dashboard.
 * Parameterized queries để chống SQL Injection.
 */

const db = require("../config/db");

const DashboardModel = {
  /**
   * Author Dashboard: Tổng views và comments của TẤT CẢ truyện do author sáng tác
   */
  getAuthorTotals: async (authorId) => {
    const [rows] = await db.query(
      `SELECT
         COALESCE(SUM(tn.luot_xem), 0) AS total_views,
         COALESCE((
           SELECT COUNT(*) FROM comments c
           JOIN truyen_new t ON c.truyen_id = t.id
           WHERE t.user_id = ? AND (c.is_deleted = 0 OR c.is_deleted IS NULL)
         ), 0) AS total_comments
       FROM truyen_new tn
       WHERE tn.user_id = ?`,
      [authorId, authorId]
    );
    return rows[0];
  },

  /**
   * Author Dashboard: Dữ liệu biểu đồ 7 ngày gần nhất
   * Lấy từ daily_stats cho các truyện của author, nhóm theo ngày.
   * Format thân thiện ApexCharts/Chart.js: { labels: [...], series: [{ name, data }] }
   */
  getAuthorChartDataLast7Days: async (authorId) => {
    const [rows] = await db.query(
      `SELECT
         ds.date,
         SUM(ds.views_count) AS views,
         SUM(ds.comments_count) AS comments
       FROM daily_stats ds
       JOIN truyen_new tn ON ds.novel_id = tn.id
       WHERE tn.user_id = ?
         AND ds.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY ds.date
       ORDER BY ds.date ASC`,
      [authorId]
    );

    // Fill missing dates với 0 (7 ngày gần nhất luôn có đủ 7 phần tử)
    const last7Dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Dates.push(d.toISOString().slice(0, 10));
    }

    const toDateKey = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10));
    const rowMap = new Map(rows.map((r) => [toDateKey(r.date), r]));

    const labels = last7Dates.map((d) => {
      const dt = new Date(d + "T00:00:00");
      return dt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    });

    const viewsData = last7Dates.map((d) => {
      const r = rowMap.get(d);
      return r ? parseInt(r.views, 10) : 0;
    });

    const commentsData = last7Dates.map((d) => {
      const r = rowMap.get(d);
      return r ? parseInt(r.comments, 10) : 0;
    });

    return {
      labels,
      series: [
        { name: "Lượt xem", data: viewsData },
        { name: "Bình luận", data: commentsData },
      ],
    };
  },

  /**
   * Admin Dashboard: Tổng quan toàn hệ thống
   */
  getAdminOverview: async () => {
    const [rows] = await db.query(
      `SELECT
         (SELECT COALESCE(SUM(luot_xem), 0) FROM truyen_new) AS total_views,
         (SELECT COUNT(*) FROM truyen_new) AS total_novels,
         (SELECT COUNT(*) FROM users_new) AS total_users`
    );
    return rows[0];
  },

  /**
   * Admin Dashboard: Dữ liệu biểu đồ 7 ngày gần nhất toàn hệ thống
   */
  getAdminChartDataLast7Days: async () => {
    const [rows] = await db.query(
      `SELECT
         ds.date,
         SUM(ds.views_count) AS views,
         SUM(ds.comments_count) AS comments
       FROM daily_stats ds
       WHERE ds.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY ds.date
       ORDER BY ds.date ASC`
    );

    const last7Dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Dates.push(d.toISOString().slice(0, 10));
    }

    const toDateKey = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10));
    const rowMap = new Map(rows.map((r) => [toDateKey(r.date), r]));

    const labels = last7Dates.map((d) => {
      const dt = new Date(d + "T00:00:00");
      return dt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    });

    const viewsData = last7Dates.map((d) => {
      const r = rowMap.get(d);
      return r ? parseInt(r.views, 10) : 0;
    });

    const commentsData = last7Dates.map((d) => {
      const r = rowMap.get(d);
      return r ? parseInt(r.comments, 10) : 0;
    });

    return {
      labels,
      series: [
        { name: "Lượt xem", data: viewsData },
        { name: "Bình luận", data: commentsData },
      ],
    };
  },

  /**
   * Admin Dashboard: Top 10 truyện lượt view cao nhất
   */
  getTop10StoriesByViews: async () => {
    const [rows] = await db.query(
      `SELECT id, ten_truyen, slug, luot_xem, tac_gia, anh_bia
       FROM truyen_new
       ORDER BY luot_xem DESC
       LIMIT 10`
    );
    return rows;
  },
};

module.exports = DashboardModel;
