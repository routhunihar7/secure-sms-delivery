const mongoose = require('mongoose');
const config = require('./env');

let memoryServer = null;

async function connectDB() {
  try {
    // Attempt standard connection first
    const options = {
      serverSelectionTimeoutMS: 3000,
    };

    console.log(`[Database] Attempting connection to MongoDB: ${config.mongoUri}`);
    await mongoose.connect(config.mongoUri, options);
    console.log('[Database] MongoDB connected successfully to primary instance.');
    return { type: 'standalone', uri: config.mongoUri };
  } catch (primaryErr) {
    console.warn(`[Database] Primary MongoDB connection failed (${primaryErr.message}).`);
    
    // In development/test mode, fallback to in-memory Mongo server
    try {
      console.log('[Database] Initializing embedded MongoDB Memory Server fallback...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      
      await mongoose.connect(memUri);
      console.log(`[Database] Connected to In-Memory MongoDB at: ${memUri}`);
      return { type: 'in-memory', uri: memUri };
    } catch (memErr) {
      console.error('[Database] Failed to start MongoDB Memory Server:', memErr.message);
      throw primaryErr;
    }
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}

module.exports = { connectDB, disconnectDB };
