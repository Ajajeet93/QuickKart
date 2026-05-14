const User = require('../../models/User');
const RefreshToken = require('../../models/RefreshToken');

class AuthRepository {
    async findUserByEmail(email) {
        return await User.findOne({ email });
    }

    async findUserById(id) {
        return await User.findById(id).select('-password');
    }

    async createUser(userData) {
        const user = new User(userData);
        return await user.save();
    }

    async updateUser(id, updateData) {
        return await User.findByIdAndUpdate(id, { $set: updateData }, { new: true }).select('-password');
    }

    async saveRefreshToken(userId, token, expiresAt) {
        return await RefreshToken.create({ userId, token, expiresAt });
    }

    async findRefreshToken(token) {
        return await RefreshToken.findOne({ token });
    }

    async deleteRefreshToken(token) {
        return await RefreshToken.deleteOne({ token });
    }

    async deleteAllUserRefreshTokens(userId) {
        return await RefreshToken.deleteMany({ userId });
    }
}

module.exports = new AuthRepository();
