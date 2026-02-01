const UserLevel = require("../models/userLevels.model");

const getAllLevels = async (pagination = {}) => {
  try {
    const { limit = 10, offset = 0 } = pagination;
    const levels = await UserLevel.getAll(limit, offset);
    const total = await UserLevel.getCount();
    return { data: levels, total };
  } catch (error) {
    throw new Error("Lỗi khi lấy danh sách cấp bậc: " + error.message);
  }
};

const getLevelById = async (id) => {
  try {
    const level = await UserLevel.getById(id);
    if (!level) {
      throw new Error("Không tìm thấy cấp bậc với ID: " + id);
    }
    return level;
  } catch (error) {
    throw new Error("Lỗi khi lấy cấp bậc: " + error.message);
  }
};

module.exports = {
  getAllLevels,
  getLevelById,
};
