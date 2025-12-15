const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Register
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

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Store user info in session
        const userSession = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        };

        req.session.user = userSession;

        // Force save to ensure cookie is set before response
        req.session.save(async (err) => {
            if (err) return res.status(500).json({ error: 'Session creation failed' });

            // Populate addresses separately or just send what we have depending on needs.
            // Original code didn't store addresses in token but fetched/populated on login return? 
            // Original: await user.populate('addresses');
            // We can fetch addresses to return them.
            await user.populate('addresses');

            res.json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    addresses: user.addresses || [],
                    walletBalance: user.walletBalance,
                    role: user.role,
                    createdAt: user.createdAt
                }
            });
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

/* 
 * @desc    Login with Google
 * @route   POST /api/auth/google
 * @access  Public
 */
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: 'No credential provided' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId, picture } = payload;

        let user = await User.findOne({ email });

        if (user) {
            // If user exists but doesn't have googleId involved (e.g. traditional registered), link it or just log in?
            // For safety, if user exists, just log them in. 
            // Optional: Update profile picture?
        } else {
            // Create new user
            // Generate a random password since they use Google
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

            user = new User({
                name,
                email,
                password: randomPassword, // This will be hashed by pre-save hook
                phone: '', // Google doesn't always provide phone, user can add later
                addresses: []
            });
            await user.save();
        }

        // Create Session instead of JWT
        const userSession = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role
        };

        req.session.user = userSession;

        req.session.save(async (err) => {
            if (err) {
                console.error('Session Save Error:', err);
                return res.status(500).json({ message: 'Session creation failed' });
            }

            // Populate addresses
            await user.populate('addresses');

            res.status(200).json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    addresses: user.addresses || [],
                    walletBalance: user.walletBalance,
                    role: user.role,
                    createdAt: user.createdAt
                }
            });
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ message: 'Google authentication failed' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: 'Logout failed' });

        res.clearCookie('connect.sid'); // Default session cookie name
        res.json({ message: 'Logged out successfully' });
    });
});

// Get Current User Info
router.get('/me', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: 'No session, authorization denied' });
        }

        const user = await User.findById(req.session.user.id).select('-password').populate('addresses');

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            addresses: user.addresses || [],
            walletBalance: user.walletBalance,
            role: user.role,
            createdAt: user.createdAt
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update User Profile
router.put('/profile', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { name, phone } = req.body;
        const user = await User.findById(req.session.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();

        // Update session data
        req.session.user.name = user.name;
        req.session.user.phone = user.phone;

        req.session.save(async (err) => {
            if (err) return res.status(500).json({ message: 'Session update failed' });

            // Ensure consistency by populating addresses
            await user.populate('addresses');

            res.json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    addresses: user.addresses || [],
                    walletBalance: user.walletBalance,
                    createdAt: user.createdAt
                },
                message: 'Profile updated successfully'
            });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
