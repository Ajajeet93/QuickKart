/**
 * tokenBlacklist — stores invalidated access tokens in Redis on logout.
 *
 * Key format : token:<jwt_string>
 * Value      : "invalid"
 * TTL        : Remaining seconds until the token's own `exp` claim.
 *              Dynamic — not hardcoded — so it auto-adapts if JWT config changes.
 *
 * On logout  : blacklistToken(accessToken) is called.
 * On request : isTokenBlacklisted(accessToken) is checked in auth middleware.
 *
 * Fail-open  : If Redis is unavailable, we log a warning and allow the request
 *              through rather than locking out all users. Adjust to fail-closed
 *              if your security requirements demand it.
 */

const jwt = require('jsonwebtoken');
const { getRedisClient } = require('../../config/redis');

const KEY_PREFIX = 'token:';

/**
 * Add an access token to the Redis blacklist.
 * TTL is calculated from the token's own `exp` claim (dynamic).
 *
 * @param {string} accessToken - The raw JWT access token string
 */
const blacklistToken = async (accessToken) => {
    if (!accessToken) return;

    try {
        const redis = getRedisClient();

        // Decode without verification — we only need the `exp` claim for TTL
        const decoded = jwt.decode(accessToken);
        if (!decoded || !decoded.exp) return;

        const remainingSeconds = decoded.exp - Math.floor(Date.now() / 1000);

        // Token is already expired — no point storing it
        if (remainingSeconds <= 0) return;

        await redis.set(`${KEY_PREFIX}${accessToken}`, 'invalid', 'EX', remainingSeconds);
    } catch (err) {
        // Redis unavailable — log and continue (fail-open)
        console.error('⚠️  tokenBlacklist.blacklistToken error:', err.message);
    }
};

/**
 * Check if an access token is in the blacklist.
 *
 * @param {string} accessToken - The raw JWT access token string
 * @returns {Promise<boolean>} true if blacklisted (token is invalid)
 */
const isTokenBlacklisted = async (accessToken) => {
    if (!accessToken) return false;

    try {
        const redis = getRedisClient();
        const value = await redis.get(`${KEY_PREFIX}${accessToken}`);
        return value === 'invalid';
    } catch (err) {
        // Redis unavailable — fail-open (allow the request)
        console.error('⚠️  tokenBlacklist.isTokenBlacklisted error:', err.message);
        return false;
    }
};

module.exports = { blacklistToken, isTokenBlacklisted };
