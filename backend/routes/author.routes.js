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
const authorApplicationController = require("../controllers/authorApplication.controller");

// GET /api/author/dashboard - Dashboard tác giả (tổng views, comments, biểu đồ 7 ngày)
router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("author", "admin"),
  authorDashboardController.getAuthorDashboard
);

// POST /api/author/apply - User submits author application
router.post(
  "/apply",
  authenticateToken,
  authorApplicationController.applyAuthor
);

// GET /api/author/status - User checks application status
router.get(
    "/status",
    authenticateToken,
    authorApplicationController.getApplicationStatus
);

module.exports = router;
