/**
 * database.js — MongoDB connection management.
 *
 * SOLID / SRP: server.js should not know how to connect to MongoDB.
 *              This module owns the database lifecycle exclusively.
 */
const mongoose = require('mongoose');
const logger = require('../core/logger/logger');
const env = require('./env');

/**
 * Connect to MongoDB. Exits the process on failure.
 */
const connectDB = async () => {
    await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS:          45000,
    });
    logger.info('✅ MongoDB Connected');
};

/**
 * Gracefully close the MongoDB connection.
 */
const disconnectDB = async () => {
    await mongoose.connection.close();
    logger.info('✅ MongoDB connection closed');
};

module.exports = { connectDB, disconnectDB };
