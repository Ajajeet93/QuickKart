const Subscription = require('../../models/Subscription');
const Product = require('../../models/Product');

class SubscriptionsRepository {
    async findProductById(id) {
        return await Product.findById(id);
    }

    async findActiveSubscription(query) {
        return await Subscription.findOne(query);
    }

    async createSubscription(subscriptionData) {
        const subscription = new Subscription(subscriptionData);
        return await subscription.save();
    }

    async findUserSubscriptions(userId) {
        return await Subscription.find({ userId })
            .populate('items.product', 'name image price')
            .populate('deliveryAddress')
            .sort({ createdAt: -1 });
    }

    async findSubscriptionById(subscriptionId, userId) {
        return await Subscription.findOne({ _id: subscriptionId, userId })
            .populate('items.product', 'name image price')
            .populate('deliveryAddress');
    }

    async updateSubscriptionStatus(subscriptionId, userId, status) {
        return await Subscription.findOneAndUpdate(
            { _id: subscriptionId, userId },
            { status },
            { new: true }
        );
    }
}

module.exports = new SubscriptionsRepository();
