/**
 * Author Dashboard Controller
 *
 * API cho bảng điều khiển Tác giả.
 * Yêu cầu: req.user (từ JWT) với role author hoặc admin.
 */

const DashboardModel = require("../models/dashboard.model");

/**
 * GET /api/author/dashboard
 *
 * - Tổng views, tổng comments của TẤT CẢ truyện do author sáng tác
 * - Biểu đồ 7 ngày gần nhất (format ApexCharts/Chart.js)
 */
const getAuthorDashboard = async (req, res) => {
  try {
    const authorId = req.user.id;

    const [totals, chartData] = await Promise.all([
      DashboardModel.getAuthorTotals(authorId),
      DashboardModel.getAuthorChartDataLast7Days(authorId),
    ]);

    res.json({
      success: true,
      data: {
        totals: {
          total_views: Number(totals.total_views) || 0,
          total_comments: Number(totals.total_comments) || 0,
        },
        chart: chartData,
      },
    });
  } catch (error) {
    console.error("getAuthorDashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tải dữ liệu dashboard",
    });
  }
};

module.exports = {
  getAuthorDashboard,
};
