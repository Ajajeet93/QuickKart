const cartService = require('./cart.service');
const catchAsync = require('../../core/errors/CatchAsync');

exports.getCart = catchAsync(async (req, res) => {
    const cart = await cartService.getCart(req.user.id);
    res.status(200).json(cart);
});

exports.addToCart = catchAsync(async (req, res) => {
    const { productId, quantity, variant } = req.body;
    const cart = await cartService.addToCart(req.user.id, productId, quantity, variant);
    res.status(200).json(cart);
});

exports.updateCartItem = catchAsync(async (req, res) => {
    const { productId, quantity, weight } = req.body;
    const cart = await cartService.updateCartItem(req.user.id, productId, quantity, weight);
    res.status(200).json(cart);
});

exports.removeFromCart = catchAsync(async (req, res) => {
    const { weight } = req.query;
    const cart = await cartService.removeFromCart(req.user.id, req.params.productId, weight);
    res.status(200).json(cart);
});

exports.clearCart = catchAsync(async (req, res) => {
    await cartService.clearCart(req.user.id);
    res.status(200).json({ success: true, message: 'Cart cleared' });
});

