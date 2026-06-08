/**
 * rateLimiter.js — Custom Redis sliding window rate limiter.
 *
 * Algorithm: Sorted Set (ZSET) sliding window
 *   - Score  = request timestamp (seconds, float)
 *   - Member = crypto random hex (guaranteed unique, no collisions)
 *
 * All 4 Redis ops are batched in a single pipeline → 1 round-trip per request.
 *
 * Usage:
 *   const { createRateLimiter } = require('./rateLimiter');
 *
 *   app.use(createRateLimiter({ keyPrefix: 'global' }));         // default: 100 req/min
 *   app.use('/api/v1/auth/login', createRateLimiter({ keyPrefix: 'auth', max: 15 }));
 *
 * Key format: rl:<keyPrefix>:<ip>  — each limiter instance is fully isolated in Redis.
 */

const crypto             = require('crypto');
const { getRedisClient } = require('../../config/redis');

/**
 * @param {object}  options
 * @param {number}  [options.windowSec=60]   - Window size in seconds
 * @param {number}  [options.max=100]        - Max requests per window per IP
 * @param {string}  [options.keyPrefix]      - Unique name for this limiter (isolates Redis keys)
 * @param {string}  [options.message]        - Custom error message
 * @returns {import('express').RequestHandler}
 */
const createRateLimiter = ({
    windowSec = 60,
    max       = 100,
    keyPrefix = 'global',
    message   = 'Too many requests, please try again later.',
} = {}) => {

    return async (req, res, next) => {
        const redis = getRedisClient();

        // Fail open: if Redis is down, don't block the request
        if (!redis || !redis.isReady) return next();

        const now         = Date.now() / 1000;          // float seconds (high precision)
        const windowStart = now - windowSec;
        const key         = `rl:${keyPrefix}:${req.ip}`; // rl:<limiter>:<ip> — fully isolated per limiter
        const member      = crypto.randomBytes(8).toString('hex'); // 16-char unique hex

        try {
            // node-redis v4: use multi() for a pipeline.
            // exec() returns a flat array of results: [r0, r1, r2, r3]
            // If any command errors, exec() throws — caught below (fail-open).
            const [, , count] = await redis
                .multi()
                .zRemRangeByScore(key, 0, windowStart)      // 1. Evict expired entries
                .zAdd(key, { score: now, value: member })   // 2. Record this request
                .zCard(key)                                  // 3. Count requests in window
                .expire(key, windowSec)                      // 4. Auto-expire the key (TTL safety)
                .exec();

            // Set standard rate-limit response headers
            res.set({
                'RateLimit-Limit'     : max,
                'RateLimit-Remaining' : Math.max(0, max - count),
                'RateLimit-Reset'     : Math.ceil(now + windowSec),
            });

            if (count > max) {
                return res.status(429).json({ success: false, message });
            }

            next();
        } catch (err) {
            // Fail open on unexpected Redis errors (log in prod via error handler)
            next();
        }
    };
};

module.exports = { createRateLimiter };
