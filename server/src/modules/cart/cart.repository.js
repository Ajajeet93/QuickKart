const Cart = require('../../models/Cart');

class CartRepository {
    async findCartByUserId(userId) {
        return await Cart.findOne({ userId }).populate('items.product');
    }

    async createCart(cartData) {
        const cart = new Cart(cartData);
        return await cart.save();
    }

    async saveCart(cart) {
        cart.updatedAt = Date.now();
        await cart.save();
        return await cart.populate('items.product');
    }
}

module.exports = new CartRepository();
