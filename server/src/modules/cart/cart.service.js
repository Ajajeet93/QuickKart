const cartRepository = require('./cart.repository');
const Product = require('../../models/Product');
const { NotFoundError, BadRequestError } = require('../../core/errors/AppError');

class CartService {
    async getCart(userId) {
        let cart = await cartRepository.findCartByUserId(userId);
        if (!cart) {
            cart = await cartRepository.createCart({ userId, items: [] });
        }
        return cart;
    }

    async addToCart(userId, productId, quantity = 1, variant) {
        // ── Stock check before adding to cart ─────────────────────────
        const product = await Product.findById(productId);
        if (!product) throw new NotFoundError('Product not found');
        if (product.stock <= 0) throw new BadRequestError(`"${product.name}" is out of stock`);

        let cart = await cartRepository.findCartByUserId(userId);
        if (!cart) {
            cart = await cartRepository.createCart({ userId, items: [] });
        }

        // Filter out items where product reference was deleted
        cart.items = cart.items.filter(item => item.product);

        const itemIndex = cart.items.findIndex(p =>
            p.product._id.toString() === productId && p.variant?.weight === variant?.weight
        );

        const existingQty = itemIndex > -1 ? cart.items[itemIndex].quantity : 0;
        const requestedTotalQty = existingQty + quantity;

        if (requestedTotalQty > product.stock) {
            throw new BadRequestError(
                `Only ${product.stock} unit(s) of "${product.name}" available. You already have ${existingQty} in your cart.`
            );
        }

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                variant
            });
        }

        return await cartRepository.saveCart(cart);
    }

    async updateCartItem(userId, productId, quantity, weight) {
        let cart = await cartRepository.findCartByUserId(userId);
        if (!cart) {
            throw new NotFoundError('Cart not found');
        }

        // Filter out items where product reference was deleted
        cart.items = cart.items.filter(item => item.product);

        const itemIndex = cart.items.findIndex(p =>
            p.product._id.toString() === productId && p.variant?.weight === weight
        );

        if (itemIndex > -1) {
            if (quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            } else {
                // ── Stock check before updating quantity ──────────────
                const product = await Product.findById(productId);
                if (product && quantity > product.stock) {
                    throw new BadRequestError(
                        `Only ${product.stock} unit(s) of "${product.name}" available in stock.`
                    );
                }
                cart.items[itemIndex].quantity = quantity;
            }
            return await cartRepository.saveCart(cart);
        } else {
            throw new NotFoundError('Item not found in cart');
        }
    }

    async removeFromCart(userId, productId, weight) {
        let cart = await cartRepository.findCartByUserId(userId);
        if (!cart) {
            throw new NotFoundError('Cart not found');
        }

        cart.items = cart.items.filter(item =>
            !(item.product && item.product._id.toString() === productId && item.variant?.weight === weight)
        );

        return await cartRepository.saveCart(cart);
    }

    async clearCart(userId) {
        let cart = await cartRepository.findCartByUserId(userId);
        if (cart) {
            cart.items = [];
            await cartRepository.saveCart(cart);
        }
    }
}

module.exports = new CartService();
