/**
 * Admin Dashboard Controller
 *
 * API cho bảng điều khiển Quản trị.
 * Yêu cầu: req.user với role admin.
 */

const DashboardModel = require("../models/dashboard.model");

/**
 * GET /api/admin/dashboard
 *
 * - Tổng quan: total_views, total_novels, total_users
 * - Top 10 truyện có lượt view cao nhất
 */
const getAdminDashboard = async (req, res) => {
  try {
    const [overview, topStories, chartData] = await Promise.all([
      DashboardModel.getAdminOverview(),
      DashboardModel.getTop10StoriesByViews(),
      DashboardModel.getAdminChartDataLast7Days(),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total_views: Number(overview.total_views) || 0,
          total_novels: Number(overview.total_novels) || 0,
          total_users: Number(overview.total_users) || 0,
        },
        chart: chartData,
        top_stories: topStories,
      },
    });
  } catch (error) {
    console.error("getAdminDashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tải dữ liệu admin dashboard",
    });
  }
};

module.exports = {
  getAdminDashboard,
};
