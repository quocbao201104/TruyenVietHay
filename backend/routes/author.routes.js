/**
 * Author Routes
 *
 * Các API dành cho Tác giả (Author Dashboard).
 * RBAC: Cần đăng nhập + role author hoặc admin.
 */

const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const authorDashboardController = require("../controllers/authorDashboard.controller");

// GET /api/author/dashboard - Dashboard tác giả (tổng views, comments, biểu đồ 7 ngày)
router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("author", "admin"),
  authorDashboardController.getAuthorDashboard
);

module.exports = router;
