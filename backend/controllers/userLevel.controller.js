const levelService = require("../services/userLevel.service");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/apiResponse");
const { getPaginationParams } = require("../utils/pagination");
const getAllLevels = async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { data, total } = await levelService.getAllLevels({ limit, offset });
    
    return paginatedResponse(res, data, { total, page, limit }, "Lấy danh sách cấp bậc thành công");
  } catch (err) {
    return errorResponse(res, "Lỗi khi lấy danh sách cấp bậc", 500);
  }
};

const getLevelById = async (req, res) => {
  try {
    const { levelId } = req.params;
    const level = await levelService.getLevelById(levelId);
    
    if (!level) {
      return errorResponse(res, "Không tìm thấy cấp bậc", 404);
    }
    
    return successResponse(res, level, "Lấy thông tin cấp bậc thành công");
  } catch (err) {
    return errorResponse(res, "Lỗi khi lấy thông tin cấp bậc", 500);
  }
};

module.exports = {
  getAllLevels,
  getLevelById,
};
