// backend/routes/inventory.routes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const inventoryController = require("../controllers/inventory.controller");

// GET  /api/inventory/badges     → Lấy danh sách huy hiệu sở hữu
router.get("/badges", authenticateToken, inventoryController.getUserBadges);

// POST /api/inventory/equip      → Đeo huy hiệu { rewardId }
// POST /api/inventory/equip-badge → Alias (tương đương)
router.post("/equip", authenticateToken, inventoryController.equipBadge);
router.post("/equip-badge", authenticateToken, inventoryController.equipBadge);

module.exports = router;
