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

// Validate point update (admin only)
const validatePointUpdate = [
  body('user_id')
    .isInt({ min: 1 })
    .withMessage('user_id phải là số nguyên dương'),
  body('points')
    .isInt()
    .withMessage('points phải là số nguyên')
    .custom((value) => {
      if (value === 0) {
        throw new Error('points không được bằng 0');
      }
      return true;
    }),
  handleValidationErrors,
];

module.exports = {
  validatePointUpdate,
  handleValidationErrors,
};
