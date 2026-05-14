const subscriptionsRepository = require('./subscriptions.repository');
const { NotFoundError, BadRequestError } = require('../../core/errors/AppError');

class SubscriptionsService {
    async createSubscription(userId, data) {
        const { items, frequency, deliveryAddressId, startDate, forceMerge, paymentMethod } = data;

        const conflicts = [];
        const processedItems = []; 

        for (const item of items) {
            const product = await subscriptionsRepository.findProductById(item.product);
            if (!product) {
                throw new NotFoundError(`Product not found: ${item.product}`);
            }

            const query = {
                userId,
                'items.product': product._id,
                status: 'Active',
                frequency
            };

            if (item.variant && item.variant.weight) {
                query['items.variant.weight'] = item.variant.weight;
            }

            const existingSubscription = await subscriptionsRepository.findActiveSubscription(query);

            if (existingSubscription && !forceMerge) {
                const variantText = item.variant && item.variant.weight ? `(${item.variant.weight})` : '';
                conflicts.push({
                    product: `${product.name} ${variantText}`,
                    productId: product._id,
                    existingSubId: existingSubscription._id
                });
            } else {
                processedItems.push({
                    ...item,
                    priceAtSubscription: item.variant && item.variant.price ? item.variant.price : product.price
                });
            }
        }

        if (conflicts.length > 0 && !forceMerge) {
            return {
                status: 'conflict',
                message: 'You already have active subscriptions for some of these items at the same frequency.',
                conflicts
            };
        }

        if (processedItems.length === 0) {
            throw new BadRequestError('No items to subscribe after conflict resolution.');
        }

        const nextDeliveryDate = startDate ? new Date(startDate) : new Date();
        if (!startDate) {
            nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 1); // Default to tomorrow
        }
        nextDeliveryDate.setHours(8, 0, 0, 0); // Default delivery time 8 AM

        const newSubscription = await subscriptionsRepository.createSubscription({
            userId,
            items: processedItems,
            frequency,
            status: 'Active', // Activate immediately so cron can process it
            nextDeliveryDate,
            deliveryAddress: deliveryAddressId,
            paymentMethod: paymentMethod || 'Wallet', // Default to Wallet if not specified
        });

        return {
            status: 'success',
            message: 'Subscription created successfully',
            subscription: newSubscription
        };
    }

    async getUserSubscriptions(userId) {
        return await subscriptionsRepository.findUserSubscriptions(userId);
    }

    async getSubscriptionById(subscriptionId, userId) {
        const subscription = await subscriptionsRepository.findSubscriptionById(subscriptionId, userId);
        if (!subscription) throw new NotFoundError('Subscription not found');
        return subscription;
    }

    async updateSubscription(subscriptionId, userId, updates) {
        const subscription = await subscriptionsRepository.findSubscriptionById(subscriptionId, userId);
        if (!subscription) throw new NotFoundError('Subscription not found');

        // Apply flexible updates
        if (updates.status) subscription.status = updates.status;
        if (updates.frequency) subscription.frequency = updates.frequency;
        if (updates.deliveryAddressId) subscription.deliveryAddress = updates.deliveryAddressId;
        if (updates.quantity !== undefined && subscription.items.length > 0) {
            subscription.items[0].quantity = updates.quantity;
        }

        return await subscription.save();
    }

    async deleteSubscription(subscriptionId, userId) {
        const subscription = await subscriptionsRepository.findSubscriptionById(subscriptionId, userId);
        if (!subscription) throw new NotFoundError('Subscription not found');
        subscription.status = 'Cancelled';
        await subscription.save();
    }

    async updateSubscriptionStatus(subscriptionId, userId, status) {
        const subscription = await subscriptionsRepository.updateSubscriptionStatus(subscriptionId, userId, status);
        if (!subscription) {
            throw new NotFoundError('Subscription not found');
        }
        return subscription;
    }
}

module.exports = new SubscriptionsService();
