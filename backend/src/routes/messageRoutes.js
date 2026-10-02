const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyJWT } = require('../middleware/authMiddleware');
const { smsLimiter, messageAccessLimiter } = require('../middleware/rateLimiter');
const {
  createMessageValidation,
  tokenParamValidation,
  idParamValidation,
} = require('../middleware/validator');

// --- Protected Admin Routes ---
// POST /api/messages - Create message & token
router.post(
  '/',
  verifyJWT,
  createMessageValidation,
  messageController.createMessage
);

// GET /api/messages/stats/summary - Dashboard statistics
router.get(
  '/stats/summary',
  verifyJWT,
  messageController.getMessageStats
);

// GET /api/messages - List all messages
router.get(
  '/',
  verifyJWT,
  messageController.getAllMessages
);

// POST /api/messages/:id/send - Dispatch SMS
router.post(
  '/:id/send',
  verifyJWT,
  smsLimiter,
  idParamValidation,
  messageController.sendSMS
);

// GET /api/messages/details/:id - Admin view single message details
router.get(
  '/details/:id',
  verifyJWT,
  idParamValidation,
  messageController.getMessageById
);

// DELETE /api/messages/:id - Revoke message
router.delete(
  '/:id',
  verifyJWT,
  idParamValidation,
  messageController.deleteMessage
);

// --- Public Recipient Route ---
// GET /api/messages/:token - Access message via secure token
router.get(
  '/:token',
  messageAccessLimiter,
  tokenParamValidation,
  messageController.getMessageByToken
);

module.exports = router;
