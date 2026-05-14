const bcrypt = require('bcryptjs');
const authRepository = require('./auth.repository');
const { BadRequestError, UnauthorizedError } = require('../../core/errors/AppError');
const {
    generateAccessToken,
    generateRefreshToken,
    REFRESH_TOKEN_EXPIRY_MS,
    verifyRefreshToken
} = require('../../core/utils/jwt');
const { OAuth2Client } = require('google-auth-library');
const env = require('../../config/env');

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

class AuthService {
    async registerUser(userData) {
        const existingUser = await authRepository.findUserByEmail(userData.email);
        if (existingUser) {
            throw new BadRequestError('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const userToCreate = {
            ...userData,
            password: hashedPassword,
            role: 'user', // Force role to user for public registration
        };

        const newUser = await authRepository.createUser(userToCreate);
        return this._getPublicProfile(newUser);
    }

    async loginUser(email, password) {
        const user = await authRepository.findUserByEmail(email);
        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new UnauthorizedError('Invalid email or password');
        }

        await user.populate('addresses');
        return user; // Return raw user here, controller will issue tokens
    }

    async googleLogin(credential) {
        if (!credential) {
            throw new BadRequestError('Google credential is required');
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new UnauthorizedError('Invalid Google credential');
        }

        const { email, name } = payload;

        let user = await authRepository.findUserByEmail(email);

        if (!user) {
            const crypto = require('crypto');
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            const userToCreate = {
                name,
                email,
                password: hashedPassword,
                role: 'user',
            };
            user = await authRepository.createUser(userToCreate);
        }

        await user.populate('addresses');
        return user;
    }

    async rotateTokens(oldRefreshToken) {
        if (!oldRefreshToken) {
            throw new UnauthorizedError('No refresh token provided');
        }

        const decoded = verifyRefreshToken(oldRefreshToken);
        if (!decoded) {
            throw new UnauthorizedError('Refresh token expired or invalid');
        }

        const storedToken = await authRepository.findRefreshToken(oldRefreshToken);
        if (!storedToken) {
            throw new UnauthorizedError('Refresh token has been revoked or already rotated');
        }

        await authRepository.deleteRefreshToken(oldRefreshToken);

        const payload = { id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role };
        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);

        await authRepository.saveRefreshToken(
            decoded.id,
            newRefreshToken,
            new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS)
        );

        return { newAccessToken, newRefreshToken };
    }

    async logoutUser(refreshToken) {
        if (refreshToken) {
            await authRepository.deleteRefreshToken(refreshToken);
        }
    }

    async getUserProfile(userId) {
        const user = await authRepository.findUserById(userId);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }
        await user.populate('addresses');
        return user;
    }

    async updateUserProfile(userId, updateData) {
        const user = await authRepository.updateUser(userId, updateData);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }
        await user.populate('addresses');
        return user;
    }

    _getPublicProfile(user) {
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            addresses: user.addresses || [],
            walletBalance: user.walletBalance,
            role: user.role,
            createdAt: user.createdAt,
        };
    }
}

module.exports = new AuthService();
