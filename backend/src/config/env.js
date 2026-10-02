const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  publicAppUrl: process.env.PUBLIC_APP_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/secure_sms_delivery',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_jwt_key_secure_sms_delivery_min_32_bytes_long_safe',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  defaultAdmin: {
    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@securesms.local',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'AdminSecure@123456',
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
  rateLimits: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 mins
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    smsMax: parseInt(process.env.SMS_RATE_LIMIT_MAX, 10) || 10,
  },
};

module.exports = config;
