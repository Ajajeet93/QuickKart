const express = require('express');
const usersController = require('./users.controller');
const validateRequest = require('../../core/middlewares/validateRequest');
const { createUserSchema, addressSchema, updateAddressSchema } = require('./users.validation');
const { isAuthenticated, isAdmin } = require('../../core/middlewares/auth');

const router = express.Router();

// Admin User Management routes
router.get('/all', isAuthenticated, isAdmin, usersController.getAllUsers);
router.post('/create', isAuthenticated, isAdmin, validateRequest(createUserSchema), usersController.createUser);
router.delete('/:id', isAuthenticated, isAdmin, usersController.deleteUser);

// User Addresses routes
router.get('/addresses', isAuthenticated, usersController.getAddresses);
router.post('/addresses', isAuthenticated, validateRequest(addressSchema), usersController.createAddress);
router.put('/addresses/:id', isAuthenticated, validateRequest(updateAddressSchema), usersController.updateAddress);
router.delete('/addresses/:id', isAuthenticated, usersController.deleteAddress);

module.exports = router;
