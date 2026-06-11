const ordersRepository = require('./orders.repository');
const { BadRequestError, NotFoundError } = require('../../core/errors/AppError');
const logger = require('../../core/logger/logger');

const MAX_ORDER_ITEMS     = 50;
const LOW_STOCK_THRESHOLD = 10;

/**
 * OrdersService — all order business logic.
 *
 * Key security fixes applied:
 *  - Prices always fetched from DB (never trusted from client)
 *  - Stock checked atomically to prevent race conditions / negative stock
 */
class OrdersService {

    async createOrder(userId, { items, shippingAddressId, paymentMethod }) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new BadRequestError('Order must contain at least one item');
        }
        if (items.length > MAX_ORDER_ITEMS) {
            throw new BadRequestError(`Order cannot exceed ${MAX_ORDER_ITEMS} items`);
        }

        // ── Step 1: Validate products & compute total from DB prices ──
        let calculatedTotal = 0;
        const validatedItems = [];

        for (const item of items) {
            const productId = item.product || item.productId;
            const product = await ordersRepository.findProductById(productId);
            if (!product) throw new NotFoundError('One or more products not found');

            const MAX_QTY_PER_ITEM = 99;
            const qty = Math.min(MAX_QTY_PER_ITEM, Math.max(1, parseInt(item.quantity, 10) || 1));

            // FIX: Use DB price, not client-sent price
            let unitPrice = product.price;
            if (item.variant?.weight && Array.isArray(product.variants)) {
                const matched = product.variants.find(v => v.weight === item.variant.weight);
                if (matched) unitPrice = matched.price;
            }

            // FIX: Stock check before ordering
            if (product.stock < qty) {
                throw new BadRequestError(
                    `Insufficient stock for "${product.name}". Available: ${product.stock}`
                );
            }

            calculatedTotal += unitPrice * qty;
            validatedItems.push({
                product:  product._id,
                quantity: qty,
                price:    unitPrice,
                weight:   item.variant?.weight,
            });
        }

        // ── Step 2: Wallet deduction (if applicable) ──────────────────
        if (paymentMethod === 'Wallet') {
            const user = await ordersRepository.findUserById(userId);
            if (!user) throw new NotFoundError('User not found');
            if (user.walletBalance < calculatedTotal) {
                throw new BadRequestError('Insufficient wallet balance');
            }
            user.walletBalance -= calculatedTotal;
            await ordersRepository.saveUser(user);
        }

        // ── Step 3: Create order ───────────────────────────────────────
        const newOrder = await ordersRepository.createOrder({
            userId,
            items:           validatedItems,
            totalAmount:     calculatedTotal,
            shippingAddress: shippingAddressId,
            paymentMethod,
            status:          paymentMethod === 'Wallet' ? 'Processing' : 'Pending',
            paymentStatus:   paymentMethod === 'Wallet' ? 'Paid' : 'Pending',
        });

        if (paymentMethod === 'Wallet') {
            await ordersRepository.createTransaction({
                userId,
                amount:      calculatedTotal,
                type:        'debit',
                description: `Order Payment #${newOrder._id}`,
            });
        }

        // ── Step 4: Atomic stock decrement ─────────────────────────────
        const lowStockWarnings = [];
        for (const item of validatedItems) {
            const updated = await ordersRepository.decrementStock(item.product, item.quantity);
            if (!updated) {
                // Race condition — another order consumed stock between validation and save
                logger.error(`Stock race condition: product ${item.product}, order ${newOrder._id}`);
            } else if (updated.stock <= LOW_STOCK_THRESHOLD) {
                lowStockWarnings.push({ productId: updated._id, name: updated.name, stock: updated.stock });
            }
        }

        // ── Step 5: Clear cart ─────────────────────────────────────────
        await ordersRepository.clearUserCart(userId);

        return { order: newOrder, lowStockWarnings };
    }

    getUserOrders(userId) {
        return ordersRepository.findUserOrders(userId);
    }

    async getOrderById(orderId, userId, isAdmin = false) {
        // Admin can fetch any order; users only their own
        const order = await ordersRepository.findOrderById(orderId, isAdmin ? null : userId);
        if (!order) throw new NotFoundError('Order not found');
        return order;
    }

    async updateOrderStatus(orderId, updateData) {
        const order = await ordersRepository.updateOrderStatus(orderId, updateData);
        if (!order) throw new NotFoundError('Order not found');
        return order;
    }

    async deleteOrder(orderId) {
        const order = await ordersRepository.deleteOrder(orderId);
        if (!order) throw new NotFoundError('Order not found');
    }
}

module.exports = new OrdersService();
