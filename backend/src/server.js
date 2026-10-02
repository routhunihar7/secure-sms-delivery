const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const { connectDB } = require('./config/db');
const seedDefaultAdmin = require('./utils/seedAdmin');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const systemRoutes = require('./routes/systemRoutes');

const app = express();

// Trust proxy for rate limiter if deployed behind reverse proxy
app.set('trust proxy', 1);

// Security Middleware: Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible media rendering and external assets
    crossOriginEmbedderPolicy: false,
  })
);

// CORS Configuration
const allowedOrigins = [
  config.clientUrl,
  config.publicAppUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev mode for testing flexibility
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Logging middleware
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General Rate Limiter on all API routes
app.use('/api', apiLimiter);

// Root health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Secure SMS Link Delivery System API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    documentation: '/api/system/status',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/system', systemRoutes);

// 404 Catch-all handler
app.use(notFound);

// Centralized Error handler
app.use(errorHandler);

// Server startup
let server = null;

async function startServer(port = config.port) {
  try {
    // 1. Connect to MongoDB (or embedded memory server fallback)
    const dbInfo = await connectDB();
    console.log(`[Server] Database ready (${dbInfo.type} mode).`);

    // 2. Auto-seed default admin account
    await seedDefaultAdmin();

    return new Promise((resolve) => {
      server = app.listen(port, () => {
        console.log('====================================================');
        console.log(`🚀 Secure SMS Backend Server running on port ${port}`);
        console.log(`📡 Environment: ${config.nodeEnv}`);
        console.log(`🌐 API Endpoint: http://localhost:${port}`);
        console.log(`📱 Public Client URL: ${config.publicAppUrl}`);
        console.log('====================================================');
        resolve(server);
      });
    });
  } catch (error) {
    console.error('[Server] Fatal Error during server bootstrap:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
