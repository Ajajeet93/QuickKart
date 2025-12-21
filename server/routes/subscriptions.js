const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Address = require('../models/Address');


const Cart = require('../models/Cart');
const { processSubscriptions } = require('../cron/subscriptionCron');

// Middleware
const { isAuthenticated } = require('../middleware/auth');

// Mock Payment Gateway Tokenization (Simulated)
const tokenizePaymentMethod = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`pm_mock_${Math.random().toString(36).substr(2, 9)}`);
        }, 1000);
    });
};

const Product = require('../models/Product');

// POST /api/subscriptions - Create a new subscription
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { items, frequency, deliveryAddressId, startDate, forceMerge, paymentMethod } = req.body;

        // 1. Validate Items & Identify Conflicts
        const conflicts = [];
        const processedItems = []; // { item, product, existingSub }

        for (const item of items) {
            const product = await Product.findById(item.product);
            // ... (rest of loop logic is fine, let's keep it but we need to insert wallet check later)
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.product}` });
            }

            // Check for existing active subscription
            const query = {
                userId: req.user.id,
                'items.product': product._id,
                status: 'Active',
                frequency
            };

            // Only check variant weight if variant exists
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

        // 2. Decision Phase
        if (conflicts.length > 0 && !forceMerge) {
            return res.status(409).json({
                message: 'You already have subscriptions for these items.',
                conflicts
            });
        }

        // 3. Execution Phase
        let calculatedTotal = 0;
        // Calculate total first to verify wallet balance
        for (const { item, product } of processedItems) {
            // Use variant price if available, else product price
            let price = item.variant && item.variant.price ? item.variant.price : product.price;
            price = Number(price) || 0;
            const discountedPrice = price * 0.85;
            calculatedTotal += discountedPrice * (Number(item.quantity) || 1);
        }

        // Check for Future Start Date using String Comparison
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
                weight: item.variant?.weight // Include weight for order
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

        // Return Success (Pure Subscription)
        // Order will be generated by Cron at 9 AM
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

// GET /api/subscriptions - List all subscriptions for user
// GET /api/subscriptions - List all subscriptions for user
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .populate('items.product');

        // console.log('Subs fetched:', JSON.stringify(subscriptions, null, 2)); 
        res.set('Cache-Control', 'no-store');
        res.json(subscriptions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/subscriptions/:id - Get specific subscription details
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ _id: req.params.id, userId: req.user.id })
            .populate('items.product')
            .populate('deliveryAddress');

        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

        // Fetch Delivery History (Orders linked to this subscription)
        const history = await Order.find({
            userId: req.user.id,
            subscriptionIds: req.params.id
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('createdAt totalAmount status items');

        // Fetch User Addresses (Fallback for legacy subscriptions)
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

// PATCH /api/subscriptions/:id - Update status or details
router.patch('/:id', isAuthenticated, async (req, res) => {
    try {
        const { status, frequency, deliveryAddressId, quantity } = req.body;
        const updates = {};
        if (status) updates.status = status;
        if (frequency) updates.frequency = frequency;
        if (deliveryAddressId) updates.deliveryAddress = deliveryAddressId;

        // Handle quantity update for single-item subscription logic
        if (quantity) {
            // We need to use dot notation for updating specific item field in array
            // Assuming we want to update the first item's quantity as per current UI
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

// POST /api/subscriptions/test-cron - Force run cron with simulated date
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
