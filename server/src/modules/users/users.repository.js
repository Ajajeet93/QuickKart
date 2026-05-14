const User = require('../../models/User');
const Address = require('../../models/Address');
const RefreshToken = require('../../models/RefreshToken');

class UsersRepository {
    async findAllUsers() {
        return await User.find({}).select('-password').sort({ createdAt: -1 });
    }

    async findUserById(id) {
        return await User.findById(id).select('-password');
    }

    async findUserByEmail(email) {
        return await User.findOne({ email });
    }

    async deleteUser(id) {
        await RefreshToken.deleteMany({ userId: id });
        return await User.findByIdAndDelete(id);
    }

    async createUser(userData) {
        const user = new User(userData);
        return await user.save();
    }

    async findAddressesByUserId(userId) {
        return await Address.find({ userId });
    }

    async createAddress(addressData) {
        const address = new Address(addressData);
        return await address.save();
    }

    async addAddressToUser(userId, addressId) {
        return await User.findByIdAndUpdate(userId, { $push: { addresses: addressId } });
    }

    async updateAddress(addressId, userId, updateData) {
        return await Address.findOneAndUpdate(
            { _id: addressId, userId },
            { $set: updateData },
            { new: true }
        );
    }

    async deleteAddress(addressId, userId) {
        const address = await Address.findOneAndDelete({ _id: addressId, userId });
        if (address) {
            await User.findByIdAndUpdate(userId, { $pull: { addresses: addressId } });
        }
        return address;
    }
}

module.exports = new UsersRepository();
