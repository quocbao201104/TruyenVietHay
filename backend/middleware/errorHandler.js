const logger = require("../utils/logger");
const { errorResponse } = require("../utils/apiResponse");

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return errorResponse(res, 'Dữ liệu không hợp lệ', 400, err.errors);
  }

  if (err.name === 'UnauthorizedError') {
    return errorResponse(res, 'Không có quyền truy cập', 401);
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return errorResponse(res, 'Dữ liệu bị trùng lặp', 409);
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return errorResponse(res, 'Tham chiếu không hợp lệ', 400);
  }

  // Default to error status code or 500
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Lỗi server!";
  
  return errorResponse(res, message, statusCode);
};

module.exports = errorHandler;

