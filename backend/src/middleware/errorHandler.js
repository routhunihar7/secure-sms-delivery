const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `API Route Not Found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };
