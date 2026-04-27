const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

// ── Validate required environment variables at startup ─────────────
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingEnv.join(', ')}`);
    process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters for security.');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

// Trust proxy (needed for secure cookies and rate limiting behind Render / Vercel / nginx)
app.set('trust proxy', 1);

// ── Security Headers (Helmet) ──────────────────────────────────────
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false, // Disabled — handled by frontend framework
    })
);

// ── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
    // Development origins
    'http://localhost:5173', 'http://127.0.0.1:5173',
    'http://localhost:5174', 'http://127.0.0.1:5174',
    'http://localhost:5175', 'http://127.0.0.1:5175',
].filter(Boolean).map((o) => o.replace(/\/$/, ''));

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin) || !isProduction) {
                callback(null, true);
            } else {
                callback(new Error(`CORS blocked: ${origin}`));
            }
        },
        credentials: true,
    })
);

// Required for Google popup auth
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    next();
});

// ── Rate Limiting ─────────────────────────────────────────────────
// Global limiter — prevents general abuse
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Strict limiter for auth endpoints — prevents brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many login attempts, please try again after 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/google', authLimiter);
app.use('/api/admin/login', authLimiter);

// ── Core Middleware ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Sanitize request data against NoSQL injection
app.use(mongoSanitize());

// ── Request Logger (development only) ────────────────────────────
if (!isProduction) {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.originalUrl}`);
        next();
    });
}

// ── Database ──────────────────────────────────────────────────────
mongoose
    .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    })
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

// ── Cron Jobs ─────────────────────────────────────────────────────
const { initCron } = require('./cron/subscriptionCron');
const { initSimulationCron } = require('./cron/orderSimulationCron');
initCron();
initSimulationCron();

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/user',          require('./routes/user'));
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/cart',          require('./routes/cart'));
app.use('/api/search',        require('./routes/search'));
app.use('/api/wallet',        require('./routes/wallet'));
app.use('/api/support',       require('./routes/support'));
app.use('/api',               require('./routes/products'));

// ── Health Check ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
});

// ── 404 Handler ───────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────────
// Never expose stack traces in production
app.use((err, req, res, next) => {
    const status = err.status || 500;
    console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);
    res.status(status).json({
        message: isProduction ? 'Internal Server Error' : err.message,
        ...(isProduction ? {} : { stack: err.stack }),
    });
});

// ── Graceful Shutdown ─────────────────────────────────────────────
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed. Server stopped.');
        process.exit(0);
    });
    // Force exit if graceful shutdown hangs
    setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException',  (err) => { console.error('Uncaught Exception:',  err); shutdown('uncaughtException'); });
process.on('unhandledRejection', (err) => { console.error('Unhandled Rejection:', err); shutdown('unhandledRejection'); });
