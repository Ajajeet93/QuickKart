const express = require('express');
const authController = require('./auth.controller');
const validateRequest = require('../../core/middlewares/validateRequest');
const { registerSchema, loginSchema } = require('./auth.validation');
const { isAuthenticated } = require('../../core/middlewares/auth');

const router = express.Router();

// Public routes
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/google', authController.googleLogin);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', isAuthenticated, authController.getMe);
router.put('/profile', isAuthenticated, authController.updateProfile);

module.exports = router;
