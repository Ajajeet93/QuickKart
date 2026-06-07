const Redis  = require('ioredis');
const logger = require('../core/logger/logger');
const env    = require('./env');

// This holds our Redis connection once it's created
let redisClient = null;

// Connect to Redis
const connectRedis = async () => {

    // Use TLS only if explicitly set in env (REDIS_TLS=true)
    const useTLS = env.REDIS_TLS === true;

    redisClient = new Redis({
        host:     env.REDIS_HOST,
        port:     env.REDIS_PORT,
        username: env.REDIS_USERNAME,
        password: env.REDIS_PASSWORD,
        tls:      useTLS ? { rejectUnauthorized: false } : undefined,
    });

    // Wait until the connection is actually ready before continuing
    await new Promise((resolve, reject) => {
        redisClient.once('ready', resolve);
        redisClient.once('error', reject);
    });

    logger.info('✅ Redis connected');
};

// Disconnect from Redis (called on server shutdown)
const disconnectRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        logger.info('✅ Redis connection closed');
    }
};

// Get the active Redis client (used by tokenBlacklist.js)
const getRedisClient = () => redisClient;

module.exports = { connectRedis, disconnectRedis, getRedisClient };
