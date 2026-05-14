const express        = require('express');
const adminController = require('./admin.controller');
const validateRequest = require('../../core/middlewares/validateRequest');
const { isAdminAuthenticated } = require('../../core/middlewares/auth');
const {
    loginSchema,
    updateOrderStatusSchema,
    updateSupportStatusSchema,
    createUserSchema,
    paginationSchema,
} = require('./admin.validation');

const router = express.Router();

// ── Public ─────────────────────────────────────────────────────────
router.post('/login',   validateRequest(loginSchema),   adminController.login);
router.post('/refresh',                                 adminController.refresh);
// Logout must NOT require auth — access token may be expired when user calls it.
// The server reads the refresh cookie directly to revoke the session.
router.post('/logout',                                  adminController.logout);

// ── Protected (admin token required) ──────────────────────────────
router.use(isAdminAuthenticated);

router.get('/me',                                        adminController.getMe);
router.get('/stats',                                     adminController.getStats);

// Users
router.get('/users',    validateRequest(paginationSchema), adminController.listUsers);
router.post('/users',   validateRequest(createUserSchema), adminController.createUser);
router.get('/users/:id',                                 adminController.getUserDetails);
router.delete('/users/:id',                              adminController.deleteUser);

// Orders
router.get('/orders',   validateRequest(paginationSchema),       adminController.listOrders);
router.put('/orders/:id/status', validateRequest(updateOrderStatusSchema), adminController.updateOrderStatus);
router.delete('/orders/:id',                             adminController.deleteOrder);

// Support
router.get('/support',                                   adminController.listSupportRequests);
router.put('/support/:id/status', validateRequest(updateSupportStatusSchema), adminController.updateSupportStatus);

module.exports = router;
