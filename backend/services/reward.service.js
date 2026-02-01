const Reward = require("../models/reward.model");

const getAllRewards = async (pagination = {}) => {
  try {
    const { limit = 10, offset = 0 } = pagination;
    const rewards = await Reward.getAll(limit, offset);
    const total = await Reward.getCount();
    return { data: rewards, total };
  } catch (error) {
    throw new Error("Lỗi khi lấy danh sách phần thưởng: " + error.message);
  }
};

const createReward = async (data) => {
  try {
    const rewardId = await Reward.create(data);
    return rewardId;
  } catch (error) {
    throw new Error("Lỗi khi tạo phần thưởng: " + error.message);
  }
};

module.exports = {
  getAllRewards,
  createReward,
};
