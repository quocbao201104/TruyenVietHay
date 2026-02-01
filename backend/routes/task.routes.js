const express = require("express");
const router = express.Router();
const taskController = require("../controllers/userTask.controller");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { validateTaskAssignment, validateTaskCompletion } = require("../validators/task.validator");

// Route lấy danh sách nhiệm vụ
router.get("/", authenticateToken, taskController.getAllTasks);

// Route gán nhiệm vụ cho người dùng
router.post(
  "/assign",
  authenticateToken,
  authorizeRoles("admin"),
  validateTaskAssignment,
  taskController.assignTask
);

// Route hoàn thành nhiệm vụ
router.post(
  "/complete",
  authenticateToken,
  validateTaskCompletion,
  taskController.completeTask
);

module.exports = router;
