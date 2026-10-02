const rateLimit = require('express-rate-limit');
const config = require('../config/env');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: config.rateLimits.windowMs,
  max: config.rateLimits.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

// Strict rate limiter for Authentication (prevents credential stuffing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login attempts. Please try again after 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});

// Strict rate limiter for SMS dispatching (prevents SMS spamming / carrier abuse)
const smsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.rateLimits.smsMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'SMS dispatch rate limit reached. Please wait before triggering more SMS deliveries.',
    code: 'SMS_RATE_LIMIT_EXCEEDED',
  },
});

// Message token retrieval rate limiter (prevents brute-forcing token hashes)
const messageAccessLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many message access attempts from this client.',
    code: 'ACCESS_RATE_LIMIT_EXCEEDED',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  smsLimiter,
  messageAccessLimiter,
};
