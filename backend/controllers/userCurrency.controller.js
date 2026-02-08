const UserCurrency = require("../models/userCurrency.model");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const getBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const balance = await UserCurrency.getBalance(userId);
    return successResponse(res, { balance }, "Lấy số dư thành công");
  } catch (err) {
    return errorResponse(res, "Lỗi khi lấy số dư", 500);
  }
};

module.exports = {
  getBalance,
};
