const rewardService = require("../services/reward.service");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/apiResponse");
const { getPaginationParams } = require("../utils/pagination");

const getAllRewards = async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { data, total } = await rewardService.getAllRewards({ limit, offset });
    
    return paginatedResponse(res, data, { total, page, limit }, "Lấy danh sách phần thưởng thành công");
  } catch (err) {
    return errorResponse(res, "Lỗi khi lấy danh sách phần thưởng", 500);
  }
};

const createReward = async (req, res) => {
  try {
    await rewardService.createReward(req.body);
    return successResponse(res, null, "Tạo phần thưởng thành công", 201);
  } catch (err) {
    return errorResponse(res, err.message || "Lỗi khi tạo phần thưởng", 500);
  }
};

module.exports = {
  getAllRewards,
  createReward,
};
