const express          = require('express');
const ordersController = require('./orders.controller');
const validateRequest  = require('../../core/middlewares/validateRequest');
const { createOrderSchema, updateOrderStatusSchema } = require('./orders.validation');
const { isAuthenticated, isAdmin } = require('../../core/middlewares/auth');

const router = express.Router();

router.use(isAuthenticated);

// User routes
router.post('/',         validateRequest(createOrderSchema), ordersController.createOrder);
router.get('/my',                                            ordersController.getUserOrders);
router.get('/:id',                                           ordersController.getOrderById);

// Admin routes (admin order listing & bulk ops live in /api/v1/admin/orders)
router.put('/:id/status',   isAdmin, validateRequest(updateOrderStatusSchema), ordersController.updateOrderStatus);
router.delete('/:id',       isAdmin,                                           ordersController.deleteOrder);

module.exports = router;
