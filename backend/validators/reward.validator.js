const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đầu vào không hợp lệ',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Validate reward creation
const validateRewardCreation = [
  body('reward_name')
    .trim()
    .notEmpty()
    .withMessage('Tên phần thưởng không được để trống')
    .isLength({ max: 255 })
    .withMessage('Tên phần thưởng không được quá 255 ký tự'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Mô tả không được quá 1000 ký tự'),
  body('points_required')
    .isInt({ min: 1 })
    .withMessage('Điểm yêu cầu phải là số nguyên dương'),
  handleValidationErrors,
];

// Validate reward claim
const validateRewardClaim = [
  body('reward_id')
    .isInt({ min: 1 })
    .withMessage('reward_id phải là số nguyên dương'),
  handleValidationErrors,
];

module.exports = {
  validateRewardCreation,
  validateRewardClaim,
  handleValidationErrors,
};
