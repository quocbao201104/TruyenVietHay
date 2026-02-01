const userRewardService = require("../services/userReward.service");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const getUserRewards = async (req, res) => {
  try {
    const requestedUserId = parseInt(req.params.userId);
    const authenticatedUserId = req.user.id;
    if (requestedUserId !== authenticatedUserId && req.user.role !== 'admin') {
      return errorResponse(res, "Bạn không có quyền xem thông tin này", 403);
    }
    const rewards = await userRewardService.getUserRewards(requestedUserId);
    return successResponse(res, rewards, "Lấy danh sách phần thưởng thành công");
  } catch (err) {
    return errorResponse(res, "Lỗi khi lấy phần thưởng đã nhận", 500);
  }
};

/**
 * Claim an UNLOCKED reward instance (Activate it)
 * Route: POST /:userRewardId/claim
 */
const claimRewardInstance = async (req, res) => {
  try {
    const user_id = req.user.id; 
    let userRewardId = req.params.userRewardId;
    
    if (!userRewardId) return errorResponse(res, "Missing userRewardId", 400);

    const result = await userRewardService.claimRewardInstance({ userId: user_id, userRewardId });
    return successResponse(res, result, "Nhận phần thưởng thành công", 200);
  } catch (err) {
    return errorResponse(res, err.message || "Lỗi khi nhận phần thưởng", 400);
  }
};

/**
 * Claim a catalog reward by meeting logic (Level/Milestone)
 * Route: POST /milestone
 * Body: { reward_id: 5 }
 */
const claimMilestone = async (req, res) => {
    try {
        const userId = req.user.id;
        const { reward_id } = req.body;
        if (!reward_id) return errorResponse(res, "Missing reward_id", 400);

        const result = await userRewardService.claimMilestone({ userId, rewardId: reward_id });
        return successResponse(res, result, "Nhận quà cấp độ thành công", 201);
    } catch (err) {
        return errorResponse(res, err.message, 400);
    }
};

/**
 * Buy a reward with Spirit Stones
 * Route: POST /buy
 * Body: { reward_id: 5 }
 */
const buyReward = async (req, res) => {
    try {
        const userId = req.user.id;
        const { reward_id } = req.body;
        if (!reward_id) return errorResponse(res, "Missing reward_id", 400);

        const result = await userRewardService.buyReward({ userId, rewardId: reward_id });
        return successResponse(res, result, "Mua vật phẩm thành công", 201);
    } catch (err) {
        return errorResponse(res, err.message, 400);
    }
};

const useReward = async (req, res) => {
    try {
        const userId = req.user.id;
        const { userRewardId } = req.params;
        const result = await userRewardService.useReward({ userId, userRewardId });
        return successResponse(res, result, "Sử dụng vật phẩm thành công");
    } catch (err) {
        return errorResponse(res, err.message, 400);
    }
};

module.exports = {
  getUserRewards,
  claimRewardInstance,
  claimMilestone,
  buyReward,
  useReward
};
