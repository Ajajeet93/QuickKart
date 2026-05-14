const ordersService   = require('./orders.service');
const catchAsync      = require('../../core/errors/CatchAsync');
const { success, created } = require('../../core/utils/apiResponse');

exports.createOrder = catchAsync(async (req, res) => {
    const { order, lowStockWarnings } = await ordersService.createOrder(req.user.id, req.body);
    created(res, 'Order placed successfully', { order, lowStockWarnings });
});

exports.getUserOrders = catchAsync(async (req, res) => {
    const orders = await ordersService.getUserOrders(req.user.id);
    success(res, 200, 'Orders fetched', orders);
});

exports.getOrderById = catchAsync(async (req, res) => {
    const isAdmin = req.user.role === 'admin';
    const order = await ordersService.getOrderById(req.params.id, req.user.id, isAdmin);
    success(res, 200, 'Order fetched', order);
});

exports.updateOrderStatus = catchAsync(async (req, res) => {
    const order = await ordersService.updateOrderStatus(req.params.id, req.body);
    success(res, 200, 'Order status updated', order);
});

exports.deleteOrder = catchAsync(async (req, res) => {
    await ordersService.deleteOrder(req.params.id);
    success(res, 200, 'Order deleted');
});
