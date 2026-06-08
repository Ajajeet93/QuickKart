const { createClient } = require('redis');
const logger           = require('../core/logger/logger');
const env              = require('./env');

// This holds our Redis connection once it's created
let redisClient = null;

// Connect to Redis
const connectRedis = async () => {

    // Use TLS only if explicitly set in env (REDIS_TLS=true)
    const useTLS = env.REDIS_TLS === true;

    redisClient = createClient({
        socket: {
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
            tls:  useTLS,
            rejectUnauthorized: false,
        },
        username: env.REDIS_USERNAME,
        password: env.REDIS_PASSWORD,
    });

    // node-redis v4: errors must be handled via the 'error' event listener,
    // otherwise unhandled errors will crash the process.
    redisClient.on('error', (err) => {
        logger.error('Redis client error:', err.message);
    });

    // .connect() returns a promise that resolves when the connection is ready
    await redisClient.connect();

    logger.info('✅ Redis connected');
};

// Disconnect from Redis (called on server shutdown)
const disconnectRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        logger.info('✅ Redis connection closed');
    }
};

// Get the active Redis client (used by rateLimiter, tokenBlacklist, etc.)
const getRedisClient = () => redisClient;

module.exports = { connectRedis, disconnectRedis, getRedisClient };
