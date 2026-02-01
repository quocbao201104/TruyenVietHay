const levelHistoryService = require("../services/userLevelHistory.service");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/apiResponse");
const { getPaginationParams } = require("../utils/pagination");

const getHistoryByUserId = async (req, res) => {
  try {
    const requestedUserId = parseInt(req.params.userId);
    const authenticatedUserId = req.user.id;
    
    // Can only view own data unless admin
    if (requestedUserId !== authenticatedUserId && req.user.role !== 'admin') {
      return errorResponse(res, "Bạn không có quyền xem thông tin này", 403);
    }
    
    const { page, limit, offset } = getPaginationParams(req);
    const { data, total } = await levelHistoryService.getHistoryByUserId(requestedUserId, { limit, offset });
    
    return paginatedResponse(res, data, { total, page, limit }, "Lấy lịch sử cấp bậc thành công");
  } catch (err) {
    return errorResponse(res, err.message || "Lỗi khi lấy lịch sử cấp bậc", 500);
  }
};

const addHistory = async (req, res) => {
  try {
    const { user_id, level_id, old_level_id, timeSpent } = req.body;

    await levelHistoryService.createHistory({
      user_id,
      level_id,
      old_level_id,
      timeSpent,
    });

    const historyData = req.body;
    await levelHistoryService.createHistory(historyData);
    return successResponse(res, null, "Tạo lịch sử cấp bậc thành công", 201);
  } catch (err) {
    return errorResponse(res, err.message || "Lỗi khi tạo lịch sử cấp bậc", 500);
  }
};

const upgradeLevel = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await levelHistoryService.autoUpgrade(user_id);
    return successResponse(res, result, result.message || "Thăng cấp thành công", 201);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi thăng cấp", error: err.message });
  }
};



module.exports = {
  getHistoryByUserId,
  addHistory,
  upgradeLevel,
};
