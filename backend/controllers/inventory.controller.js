// backend/controllers/inventory.controller.js
const InventoryModel = require("../models/inventory.model");

// ============================================================
// GET /api/inventory/badges
// Lấy tất cả huy hiệu mà user đang sở hữu
// ============================================================
exports.getUserBadges = async (req, res) => {
  try {
    const userId = req.user.id;
    const badges = await InventoryModel.getUserBadges(userId);
    res.json({ success: true, data: badges });
  } catch (err) {
    console.error("Lỗi lấy danh sách huy hiệu:", err.message);
    res.status(500).json({ success: false, message: "Không thể lấy danh sách huy hiệu." });
  }
};

// ============================================================
// POST /api/inventory/equip-badge
// User đeo 1 huy hiệu — body: { rewardId: number }
// ============================================================
exports.equipBadge = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rewardId } = req.body;

    // Validate input
    if (!rewardId || isNaN(Number(rewardId))) {
      return res.status(400).json({ success: false, message: "rewardId không hợp lệ." });
    }

    const result = await InventoryModel.equipBadge(userId, Number(rewardId));

    res.json({
      success: true,
      message: "Đeo huy hiệu thành công!",
      data: result,
    });
  } catch (err) {
    // Các lỗi nghiệp vụ (không sở hữu, không phải badge) trả về 400
    const isBusinessError = [
      "Bạn không sở hữu huy hiệu này.",
      "Vật phẩm này không phải huy hiệu (badge).",
    ].includes(err.message);

    const status = isBusinessError ? 400 : 500;
    console.error("Lỗi equip badge:", err.message);
    res.status(status).json({ success: false, message: err.message });
  }
};
