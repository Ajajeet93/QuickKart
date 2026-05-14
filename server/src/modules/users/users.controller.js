const usersService = require('./users.service');
const catchAsync = require('../../core/errors/CatchAsync');

exports.getAllUsers = catchAsync(async (req, res) => {
    const users = await usersService.getAllUsers();
    res.status(200).json(users);
});

exports.deleteUser = catchAsync(async (req, res) => {
    await usersService.deleteUser(req.params.id);
    res.status(200).json({ message: 'User deleted' });
});

exports.createUser = catchAsync(async (req, res) => {
    const user = await usersService.createUser(req.body);
    res.status(201).json({
        message: 'User created successfully',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        }
    });
});

exports.getAddresses = catchAsync(async (req, res) => {
    const addresses = await usersService.getUserAddresses(req.user.id);
    res.status(200).json(addresses);
});

exports.createAddress = catchAsync(async (req, res) => {
    const address = await usersService.addAddress(req.user.id, req.body);
    res.status(201).json(address);
});

exports.updateAddress = catchAsync(async (req, res) => {
    const address = await usersService.updateAddress(req.params.id, req.user.id, req.body);
    res.status(200).json(address);
});

exports.deleteAddress = catchAsync(async (req, res) => {
    await usersService.deleteAddress(req.params.id, req.user.id);
    res.status(200).json({ message: 'Address deleted' });
});
