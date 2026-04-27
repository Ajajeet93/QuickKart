const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    accessCookieOptions,
    refreshCookieOptions,
    REFRESH_TOKEN_EXPIRY_MS,
} = require('../utils/jwt');
const { isAuthenticated } = require('../middleware/auth');

const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

// ── Shared helper: issue both tokens and persist refresh token ─────
async function issueTokens(user, res) {
    const payload = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const accessToken  = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Persist refresh token in DB so it can be revoked on logout
    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    });

    res.cookie('access_token',  accessToken,  accessCookieOptions(isProduction));
    res.cookie('refresh_token', refreshToken, refreshCookieOptions(isProduction));
}

// ── Shared helper: clear both cookies and delete refresh token ─────
async function revokeTokens(req, res) {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
        await RefreshToken.deleteOne({ token: refreshToken }).catch(() => {});
    }
    res.clearCookie('access_token',  { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax' });
    res.clearCookie('refresh_token', { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax' });
}

// ────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword, phone });
        await newUser.save();

        await issueTokens(newUser, res);

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                addresses: [],
                walletBalance: newUser.walletBalance,
                role: newUser.role,
                createdAt: newUser.createdAt,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User does not exist' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        await user.populate('addresses');
        await issueTokens(user, res);

        return res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                addresses: user.addresses || [],
                walletBalance: user.walletBalance,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ────────────────────────────────────────────────────────────────
// POST /api/auth/google
// ────────────────────────────────────────────────────────────────
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) return res.status(400).json({ message: 'No credential provided' });

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            // Hash the random password (Bug Fix)
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, await bcrypt.genSalt(10));
            user = new User({ name, email, password: hashedPassword, phone: '', addresses: [] });
            await user.save();
        }

        await user.populate('addresses');
        await issueTokens(user, res);

        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                addresses: user.addresses || [],
                walletBalance: user.walletBalance,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ message: 'Google authentication failed' });
    }
});

// ────────────────────────────────────────────────────────────────
// POST /api/auth/refresh  — Refresh Token Rotation
//
// Every call:
//  1. Verify the refresh_token cookie (JWT signature + expiry)
//  2. Confirm it exists in DB (not revoked by logout)
//  3. DELETE the old refresh token from DB
//  4. Generate brand-new access_token + refresh_token
//  5. Save new refresh token to DB
//  6. Set both new cookies
//
// Security benefit: if a refresh token is stolen, the attacker can
// only use it once. After the legitimate client rotates it, the
// stolen token is invalid and any further use triggers a 401.
// ────────────────────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
    try {
        const oldRefreshToken = req.cookies.refresh_token;

        if (!oldRefreshToken) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }

        // Verify JWT signature + expiry
        const decoded = verifyToken(oldRefreshToken);
        if (!decoded) {
            return res.status(401).json({ message: 'Refresh token expired or invalid' });
        }

        // Check it exists in DB (not already revoked/rotated)
        const stored = await RefreshToken.findOne({ token: oldRefreshToken });
        if (!stored) {
            return res.status(401).json({ message: 'Refresh token has been revoked or already rotated' });
        }

        // ── ROTATE ──────────────────────────────────────────────
        // Delete the old refresh token immediately
        await RefreshToken.deleteOne({ token: oldRefreshToken });

        // Generate both new tokens
        const payload = {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role,
        };

        const newAccessToken  = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);

        // Persist the new refresh token in DB
        await RefreshToken.create({
            userId: decoded.id,
            token: newRefreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
        });

        // Set both new cookies
        res.cookie('access_token',  newAccessToken,  accessCookieOptions(isProduction));
        res.cookie('refresh_token', newRefreshToken, refreshCookieOptions(isProduction));

        return res.json({ message: 'Tokens rotated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// Deletes the refresh token from DB (revokes session), clears both cookies.
// ────────────────────────────────────────────────────────────────
router.post('/logout', async (req, res) => {
    await revokeTokens(req, res);
    return res.json({ message: 'Logged out successfully' });
});

// ────────────────────────────────────────────────────────────────
// GET /api/auth/me
// ────────────────────────────────────────────────────────────────
router.get('/me', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').populate('addresses');
        if (!user) return res.status(404).json({ message: 'User not found' });

        return res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            addresses: user.addresses || [],
            walletBalance: user.walletBalance,
            role: user.role,
            createdAt: user.createdAt,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// ────────────────────────────────────────────────────────────────
// PUT /api/auth/profile
// ────────────────────────────────────────────────────────────────
router.put('/profile', isAuthenticated, async (req, res) => {
    try {
        const { name, phone } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();
        await user.populate('addresses');

        return res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                addresses: user.addresses || [],
                walletBalance: user.walletBalance,
                createdAt: user.createdAt,
            },
            message: 'Profile updated successfully',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
