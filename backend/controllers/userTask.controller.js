// controllers/task.controller.js
const taskService = require("../services/task.service");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await taskService.getAllTasks(userId);
    return successResponse(res, tasks, "Lấy danh sách nhiệm vụ thành công");
  } catch (err) {
    return errorResponse(res, "Lỗi khi lấy danh sách nhiệm vụ", 500);
  }
};

const assignTask = async (req, res) => {
  try {
    const { user_id, task_id } = req.body;
    const result = await taskService.assignTask(user_id, task_id);
    return successResponse(res, result, "Gán nhiệm vụ thành công");
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

const completeTask = async (req, res) => {
  try {
    const { task_id } = req.body;
    const user_id = req.user.id;

    const result = await taskService.completeTask(user_id, task_id);
    return successResponse(res, result, "Hoàn thành nhiệm vụ thành công");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getAllTasks,
  assignTask,
  completeTask,
};
