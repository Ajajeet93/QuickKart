const express = require('express');
const cartController = require('./cart.controller');
const validateRequest = require('../../core/middlewares/validateRequest');
const { addToCartSchema, updateCartSchema, removeFromCartSchema } = require('./cart.validation');
const { isAuthenticated } = require('../../core/middlewares/auth');

const router = express.Router();

router.use(isAuthenticated);

router.get('/', cartController.getCart);
router.post('/add', validateRequest(addToCartSchema), cartController.addToCart);
router.put('/update', validateRequest(updateCartSchema), cartController.updateCartItem);
router.delete('/clear', cartController.clearCart);
router.delete('/:productId', validateRequest(removeFromCartSchema), cartController.removeFromCart);

module.exports = router;
