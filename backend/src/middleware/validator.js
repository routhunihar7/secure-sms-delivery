const { body, param, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Validation rules
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

const createMessageValidation = [
  body('recipientPhone')
    .trim()
    .notEmpty()
    .withMessage('Recipient phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Phone number must be valid E.164 format (e.g. +1234567890 or +919876543210)'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message text cannot be empty')
    .isLength({ max: 5000 })
    .withMessage('Message text cannot exceed 5000 characters'),
  body('title')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 120 })
    .withMessage('Title cannot exceed 120 characters'),
  body('imageUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isString(),
  body('expiresInMinutes')
    .optional()
    .isInt({ min: 1, max: 43200 }) // 1 minute to 30 days
    .withMessage('Expiration must be between 1 minute and 43200 minutes (30 days)'),
  body('isOneTime')
    .optional()
    .isBoolean()
    .withMessage('isOneTime must be a boolean flag'),
  body('consentGiven')
    .custom((val) => val === true || val === 'true')
    .withMessage('Recipient consent confirmation is required for privacy and carrier compliance'),
  validate,
];

const tokenParamValidation = [
  param('token')
    .trim()
    .notEmpty()
    .withMessage('Secure token is required')
    .isLength({ min: 16, max: 128 })
    .withMessage('Invalid token format'),
  validate,
];

const idParamValidation = [
  param('id')
    .trim()
    .isMongoId()
    .withMessage('Invalid Message ID format'),
  validate,
];

module.exports = {
  loginValidation,
  createMessageValidation,
  tokenParamValidation,
  idParamValidation,
};
