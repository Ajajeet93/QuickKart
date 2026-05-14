const Order       = require('../../models/Order');
const Product     = require('../../models/Product');
const User        = require('../../models/User');
const Transaction = require('../../models/Transaction');
const Cart        = require('../../models/Cart');

/**
 * OrdersRepository — all DB operations for the orders module.
 * SOLID / DIP: Service depends on this abstraction, not on Mongoose.
 */
class OrdersRepository {
    findProductById(id)        { return Product.findById(id); }
    findUserById(id)           { return User.findById(id); }
    saveUser(user)             { return user.save(); }

    createOrder(data) {
        const order = new Order(data);
        return order.save();
    }

    createTransaction(data)    { return Transaction.create(data); }

    /**
     * Atomically decrement stock only if sufficient quantity is available.
     * Returns the updated product, or null if stock was insufficient (race condition guard).
     */
    decrementStock(productId, qty) {
        return Product.findOneAndUpdate(
            { _id: productId, stock: { $gte: qty } },
            { $inc: { stock: -qty } },
            { new: true }
        );
    }

    clearUserCart(userId) {
        return Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });
    }

    findUserOrders(userId) {
        return Order.find({ userId })
            .select('_id items totalAmount orderType paymentStatus status createdAt paymentMethod shippingAddress subscriptionId deliverySlot')
            .populate('items.product', 'name image price')
            .populate('shippingAddress')
            .sort({ createdAt: -1 });
    }

    findOrderById(orderId, userId) {
        const query = { _id: orderId };
        if (userId) query.userId = userId; // scoped to user unless admin
        return Order.findOne(query)
            .select('_id items totalAmount orderType paymentStatus status createdAt paymentMethod shippingAddress subscriptionId deliverySlot')
            .populate('items.product', 'name image price categoryId')
            .populate('shippingAddress');
    }

    updateOrderStatus(orderId, data) {
        return Order.findByIdAndUpdate(orderId, data, { new: true });
    }

    deleteOrder(id) { return Order.findByIdAndDelete(id); }
}

module.exports = new OrdersRepository();
