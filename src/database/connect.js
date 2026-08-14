const mongoose = require('mongoose');
const logger = require('../utils/logger');

let isConnected = false;

async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    logger.warn('No MONGO_URI provided in .env - Running in local persistent storage mode.');
    return false;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    logger.success('Connected to MongoDB database successfully.');
    return true;
  } catch (err) {
    logger.error('Failed to connect to MongoDB:', err.message);
    logger.warn('Falling back to local persistent store.');
    return false;
  }
}

function getDatabaseStatus() {
  return isConnected && mongoose.connection.readyState === 1;
}

module.exports = {
  connectDatabase,
  getDatabaseStatus
};
