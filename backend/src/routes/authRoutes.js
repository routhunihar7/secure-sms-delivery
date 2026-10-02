const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyJWT } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { loginValidation } = require('../middleware/validator');

// POST /api/auth/login
router.post('/login', authLimiter, loginValidation, authController.login);

// POST /api/auth/register (Create new admin user)
router.post('/register', authLimiter, authController.register);

// GET /api/auth/me (Protected: Get current user)
router.get('/me', verifyJWT, authController.getMe);

module.exports = router;
