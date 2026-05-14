const bcrypt = require('bcryptjs');
const usersRepository = require('./users.repository');
const { BadRequestError, NotFoundError } = require('../../core/errors/AppError');

class UsersService {
    async getAllUsers() {
        return await usersRepository.findAllUsers();
    }

    async deleteUser(id) {
        const user = await usersRepository.deleteUser(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        return user;
    }

    async createUser(userData) {
        const existingUser = await usersRepository.findUserByEmail(userData.email);
        if (existingUser) {
            throw new BadRequestError('User with this email already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const userToCreate = {
            ...userData,
            password: hashedPassword,
            role: userData.role || 'user',
            phone: userData.phone || ''
        };

        return await usersRepository.createUser(userToCreate);
    }

    async getUserAddresses(userId) {
        return await usersRepository.findAddressesByUserId(userId);
    }

    async addAddress(userId, addressData) {
        const address = await usersRepository.createAddress({
            ...addressData,
            userId
        });
        
        await usersRepository.addAddressToUser(userId, address._id);
        return address;
    }

    async updateAddress(addressId, userId, updateData) {
        const address = await usersRepository.updateAddress(addressId, userId, updateData);
        if (!address) {
            throw new NotFoundError('Address not found or unauthorized');
        }
        return address;
    }

    async deleteAddress(addressId, userId) {
        const address = await usersRepository.deleteAddress(addressId, userId);
        if (!address) {
            throw new NotFoundError('Address not found or unauthorized');
        }
        return address;
    }
}

module.exports = new UsersService();
