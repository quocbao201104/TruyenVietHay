const pointService = require("../services/userPoint.service");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const getUserPoints = async (req, res) => {
  try {
    const requestedUserId = parseInt(req.params.userId);
    const authenticatedUserId = req.user.id;
    
    // Can only view own data unless admin
    if (requestedUserId !== authenticatedUserId && req.user.role !== 'admin') {
      return errorResponse(res, "Bạn không có quyền xem thông tin này", 403);
    }
    
    const points = await pointService.getPointsByUserId(requestedUserId); 
    if (!points) {
      return errorResponse(res, "Không tìm thấy người dùng", 404);
    }
    
    return successResponse(res, points, "Lấy điểm người dùng thành công");
  } catch (err) {
    return errorResponse(res, "Lỗi khi lấy điểm người dùng", 500);
  }
};

const updatePoints = async (req, res) => {
  try {
    // NOTE: This endpoint is admin-only and accepts user_id in body
    // It's protected by authorizeRoles('admin') middleware in routes
    const { user_id, points } = req.body;
    const result = await pointService.createOrUpdatePoints({
      user_id,
      points,
    });
    
    return successResponse(
      res, 
      { affectedRows: result.affectedRows }, 
      "Cập nhật điểm thành công"
    );
  } catch (err) {
    return errorResponse(res, err.message || "Lỗi khi cập nhật điểm", 500);
  }
};

module.exports = {
  getUserPoints,
  updatePoints,
};
