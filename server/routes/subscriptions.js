const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Address = require('../models/Address');


const Cart = require('../models/Cart');
const { processSubscriptions } = require('../cron/subscriptionCron');

// Middleware
const { isAuthenticated } = require('../middleware/auth');

const tokenizePaymentMethod = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`pm_mock_${Math.random().toString(36).substr(2, 9)}`);
        }, 1000);
    });
};

const Product = require('../models/Product');

router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { items, frequency, deliveryAddressId, startDate, forceMerge, paymentMethod } = req.body;

        const conflicts = [];
        const processedItems = []; 

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.product}` });
            }
            const query = {
                userId: req.user.id,
                'items.product': product._id,
                status: 'Active',
                frequency
            };

            if (item.variant && item.variant.weight) {
                query['items.variant.weight'] = item.variant.weight;
            }

            const existingSubscription = await Subscription.findOne(query);

            if (existingSubscription) {
                const variantText = item.variant && item.variant.weight ? `(${item.variant.weight})` : '';
                conflicts.push({
                    product: `${product.name} ${variantText}`,
                    productId: product._id,
                    existingSubId: existingSubscription._id
                });
            }

            processedItems.push({ item, product, existingSubscription });
        }

        if (conflicts.length > 0 && !forceMerge) {
            return res.status(409).json({
                message: 'You already have subscriptions for these items.',
                conflicts
            });
        }


        let calculatedTotal = 0;
        for (const { item, product } of processedItems) {
            let price = item.variant && item.variant.price ? item.variant.price : product.price;
            price = Number(price) || 0;
            const discountedPrice = price * 0.85;
            calculatedTotal += discountedPrice * (Number(item.quantity) || 1);
        }


        const getLocalYYYYMMDD = (d) => {
            const offset = d.getTimezoneOffset() * 60000;
            const local = new Date(d.getTime() - offset);
            return local.toISOString().split('T')[0];
        };

        const todayStr = getLocalYYYYMMDD(new Date());
        const startStr = startDate ? startDate.split('T')[0] : todayStr;

        if (paymentMethod === 'Wallet') {
            const user = await User.findById(req.user.id);
            if (user.walletBalance < calculatedTotal) {
                return res.status(400).json({ message: 'Insufficient wallet balance' });
            }
        }

        const affectedSubscriptions = [];
        const orderItems = [];
        const paymentMethodId = await tokenizePaymentMethod();

        for (const { item, product, existingSubscription } of processedItems) {
            let price = item.variant && item.variant.price ? item.variant.price : product.price;
            price = Number(price) || 0;
            const discountedPrice = price * 0.85;

            orderItems.push({
                product: product._id.toString(),
                quantity: item.quantity,
                price: discountedPrice,
                weight: item.variant?.weight 
            });

            if (existingSubscription && forceMerge) {
                const updatedSub = await Subscription.findOneAndUpdate(
                    { _id: existingSubscription._id },
                    { $inc: { 'items.0.quantity': item.quantity } },
                    { new: true }
                );
                affectedSubscriptions.push(updatedSub);
            } else if (existingSubscription && !forceMerge) {
                continue;
            } else {
                const newSubscription = new Subscription({
                    userId: req.user.id,
                    items: [{
                        product: product._id,
                        quantity: item.quantity,
                        variant: item.variant
                    }],
                    frequency,
                    deliveryAddress: deliveryAddressId,
                    status: 'Active',
                    paymentMethodId,
                    nextDeliveryDate: startStr
                });
                const savedSub = await newSubscription.save();
                affectedSubscriptions.push(savedSub);
            }
        }

        await Cart.findOneAndUpdate(
            { userId: req.user.id },
            { $set: { items: [] } }
        );

        return res.status(201).json({
            subscriptions: affectedSubscriptions,
            message: 'Subscription active. First delivery scheduled for 9:00 AM on ' + startStr,
            orderId: null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});


router.get('/', isAuthenticated, async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .populate('items.product');

        res.set('Cache-Control', 'no-store');
        res.json(subscriptions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ _id: req.params.id, userId: req.user.id })
            .populate('items.product')
            .populate('deliveryAddress');

        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });


        const history = await Order.find({
            userId: req.user.id,
            subscriptionIds: req.params.id
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('createdAt totalAmount status items');

        const addresses = await Address.find({ userId: req.user.id });

        const subObj = subscription.toObject();
        subObj.history = history;
        subObj.addressList = addresses;

        res.set('Cache-Control', 'no-store');
        res.json(subObj);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/:id', isAuthenticated, async (req, res) => {
    try {
        const { status, frequency, deliveryAddressId, quantity } = req.body;
        const updates = {};
        if (status) updates.status = status;
        if (frequency) updates.frequency = frequency;
        if (deliveryAddressId) updates.deliveryAddress = deliveryAddressId;

        
        if (quantity) {
          
            updates['items.0.quantity'] = quantity;
        }

        const updatedSubscription = await Subscription.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { $set: updates },
            { new: true }
        ).populate('items.product');

        if (!updatedSubscription) return res.status(404).json({ message: 'Subscription not found' });

        res.json(updatedSubscription);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/subscriptions/:id - Permanently delete a subscription
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const deletedSubscription = await Subscription.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!deletedSubscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        res.json({ message: 'Subscription deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/test-cron', isAuthenticated, async (req, res) => {
    try {
        const { date } = req.body; // e.g., "2023-12-17"
        console.log('Manually triggering subscription check for:', date);

        await processSubscriptions(date);

        res.json({ message: `Subscription check run successfully for ${date || 'today'}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
