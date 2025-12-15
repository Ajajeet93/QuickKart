const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
let MongoStore = require('connect-mongo');
if (MongoStore.default) {
    MongoStore = MongoStore.default;
}
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173', 'http://127.0.0.1:5173',
            'http://localhost:5174', 'http://127.0.0.1:5174',
            'http://localhost:5175', 'http://127.0.0.1:5175',
            process.env.CLIENT_URL?.replace(/\/$/, ''), // Remove trailing slash if present
            process.env.ADMIN_URL?.replace(/\/$/, '')
        ].filter(Boolean); // Remove undefined if env vars are missing

        if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:') || allowedOrigins.some(o => origin === o)) {
            callback(null, true);
        } else {
            console.log('CORS Blocked:', origin);
            console.log('Allowed Origins:', allowedOrigins);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Security Headers for Google Auth Popups
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none'); // Allow external resources
    next();
});

app.use(express.json());
app.use(cookieParser());

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // Use environment variable
    resave: false,
    saveUninitialized: false, // Don't create session until something stored
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/QuickKart',
        collectionName: 'sessions',
        ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
        httpOnly: true, // Prevent client-side JS access
        secure: process.env.NODE_ENV === 'production', // Secure in production
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // 'lax' for local dev
    }
}));

// Request Logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

const authRoutes = require('./routes/auth');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/QuickKart')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// Cron Jobs
const { initCron } = require('./cron/subscriptionCron');
const { initSimulationCron } = require('./cron/orderSimulationCron');

initCron();
initSimulationCron();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', require('./routes/user'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api', require('./routes/products')); // Captures /api/products and /api/categories
app.use('/api/search', require('./routes/search'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/support', require('./routes/support'));
app.use('/api/admin', require('./routes/admin'));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
