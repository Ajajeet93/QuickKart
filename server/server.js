/**
 * server.js — application entry point.
 *
 * SOLID / SRP: This file is responsible ONLY for:
 *   1. Wiring middleware
 *   2. Mounting route modules
 *   3. Starting the HTTP server
 *   4. Graceful shutdown
 *
 * Database connection → src/config/database.js
 * Route logic        → src/modules/<name>/<name>.routes.js
 * Error handling     → src/core/middlewares/errorHandler.js
 * Env validation     → src/config/env.js
 */

const express        = require('express');
const cors           = require('cors');
const cookieParser   = require('cookie-parser');
const helmet         = require('helmet');
const rateLimit      = require('express-rate-limit');
const mongoSanitize  = require('express-mongo-sanitize');

const env            = require('./src/config/env');
const { connectDB, disconnectDB } = require('./src/config/database');
const logger         = require('./src/core/logger/logger');
const errorHandler   = require('./src/core/middlewares/errorHandler');
const { register, metricsMiddleware } = require('./src/core/utils/metrics');

const app        = express();
const PORT       = env.PORT;
const isProduction = env.NODE_ENV === 'production' || env.RENDER === 'true';

// ── Trust Proxy ───────────────────────────────────────────────────
// Only enable in production behind a known reverse proxy.
// Enabling in dev allows IP spoofing to bypass rate limits.
if (isProduction) {
    app.set('trust proxy', 1);
}

// ── Security Headers ──────────────────────────────────────────────
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginOpenerPolicy: { policy: 'unsafe-none' },
        crossOriginEmbedderPolicy: { policy: 'unsafe-none' },
    })
);

// ── Prometheus Metrics Endpoint ───────────────────────────────────
// MUST be mounted BEFORE the rate limiter so Prometheus scrapes are not throttled.
// This is an internal endpoint — in production, restrict access via nginx.
app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// ── Metrics Middleware ─────────────────────────────────────────────
// Tracks every request (method, route, status_code, duration)
app.use(metricsMiddleware);

// ── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = [
    env.CLIENT_URL,
    env.ADMIN_URL,
    // CloudFront production URLs
    'https://d1l2jawrwgmqiu.cloudfront.net',
    'https://de3rqz4r4hq4z.cloudfront.net',
    // Local development
    'http://localhost:5173', 'http://127.0.0.1:5173',
    'http://localhost:5174', 'http://127.0.0.1:5174',
    'http://localhost:5175', 'http://127.0.0.1:5175',
].filter(Boolean).map(o => o.replace(/\/$/, ''));

// Allow any Vercel preview/production deployment for this project
const allowedPatterns = [
    /^https:\/\/quick-kart[\w-]*\.vercel\.app$/,
    /^https:\/\/quickkart[\w-]*\.vercel\.app$/,
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || !isProduction) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            if (allowedPatterns.some(p => p.test(origin))) return callback(null, true);
            callback(new Error(`CORS blocked: ${origin}`));
        },
        credentials: true,
    })
);

// ── Rate Limiting ─────────────────────────────────────────────────
// Industry standard: 1-minute sliding window.
// Global  : 100 req/min per IP  — covers normal use + admin polling (~12 req/min).
// Auth    :  15 req/min per IP  — stricter for login/register endpoints.
const globalLimiter = rateLimit({
    windowMs: 60 * 1000,            // 1-minute window
    max: 100,                       // 100 req/min per IP  (~1.67 req/sec)
    standardHeaders: true,          // Return RateLimit-* headers
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
    windowMs: 60 * 1000,            // 1-minute window
    max: 15,                        // 15 login attempts / min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many login attempts, please try again after 1 minute.' },
});

app.use('/api/v1/auth/login',    authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/google',   authLimiter);
app.use('/api/v1/admin/login',   authLimiter);

// ── Core Middleware ───────────────────────────────────────────────
app.use(express.json({ limit: '100kb' }));  // 100kb — prevents payload DoS
app.use(cookieParser());
app.use(mongoSanitize());                   // NoSQL injection prevention

// ── Dev Request Logger ────────────────────────────────────────────
if (!isProduction) {
    app.use((req, res, next) => {
        logger.http(`${req.method} ${req.originalUrl}`);
        next();
    });
}

// ── Routes (Clean Module Architecture — /api/v1/*) ─────────────────
app.use('/api/v1/admin',         require('./src/modules/admin/admin.routes'));
app.use('/api/v1/auth',          require('./src/modules/auth/auth.routes'));
app.use('/api/v1/user',          require('./src/modules/users/users.routes'));
app.use('/api/v1/orders',        require('./src/modules/orders/orders.routes'));
app.use('/api/v1/subscriptions', require('./src/modules/subscriptions/subscriptions.routes'));
app.use('/api/v1/cart',          require('./src/modules/cart/cart.routes'));
app.use('/api/v1/wallet',        require('./src/modules/wallet/wallet.routes'));
app.use('/api/v1/products',      require('./src/modules/products/products.routes'));
app.use('/api/v1/categories',    require('./src/modules/categories/categories.routes'));
app.use('/api/v1/support',       require('./src/modules/support/support.routes'));
app.use('/api/v1/search',        require('./src/modules/search/search.routes'));

// ── Health Check ──────────────────────────────────────────────────
app.get(['/api/health', '/api/v1/health'], (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV, timestamp: new Date().toISOString() });
});

// ── 404 Handler ───────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'API route not found' });
});

// ── Global Error Handler ──────────────────────────────────────────
app.use(errorHandler);

// ── Startup ───────────────────────────────────────────────────────
const startServer = async () => {
    try {
        await connectDB();

        // Cron jobs (start after DB is connected)
        require('./src/cron/subscriptionCron').initCron();
        require('./src/cron/orderSimulationCron').initSimulationCron();

        const server = app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT} [${env.NODE_ENV}]`);
        });

        // ── Graceful Shutdown ─────────────────────────────────────
        const shutdown = async (signal) => {
            logger.info(`${signal} received — shutting down gracefully`);
            server.close(async () => {
                await disconnectDB();
                process.exit(0);
            });
            // Force exit if graceful shutdown hangs after 10s
            setTimeout(() => process.exit(1), 10_000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT',  () => shutdown('SIGINT'));

        process.on('uncaughtException',  (err) => {
            logger.error('Uncaught Exception:', { message: err.message, stack: err.stack });
            shutdown('uncaughtException');
        });
        process.on('unhandledRejection', (reason) => {
            logger.error('Unhandled Rejection:', { reason });
            shutdown('unhandledRejection');
        });

    } catch (err) {
        logger.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
};

startServer();
