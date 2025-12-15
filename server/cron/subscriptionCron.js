const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

const processSubscriptions = async (simulatedDate = null) => {
    console.log('Running Subscription Cron Job:', simulatedDate || new Date().toISOString());

    try {
        const today = simulatedDate ? new Date(simulatedDate) : new Date();
        today.setHours(0, 0, 0, 0);

        // Find active subscriptions due today or before (catch-up)
        const subscriptions = await Subscription.find({
            status: 'Active',
            nextDeliveryDate: { $lte: today },
            paymentMethod: { $ne: 'Credit Card' } // Only process Wallet/Auto payments. Credit Cards might need external gateway hook.
        }).populate('items.product');

        console.log(`Found ${subscriptions.length} due subscriptions.`);

        for (const sub of subscriptions) {
            try {
                // Calculate Amount
                let totalAmount = 0;
                const orderItems = [];

                for (const item of sub.items) {
                    const product = item.product; // populated
                    if (!product) continue;

                    const price = product.price * 0.85; // 15% discount
                    totalAmount += price * item.quantity;

                    orderItems.push({
                        product: product._id,
                        quantity: item.quantity,
                        price: price
                    });
                }

                if (totalAmount === 0) continue;

                // Check Wallet Balance
                const user = await User.findById(sub.userId);
                if (!user) continue;

                if (user.walletBalance >= totalAmount) {
                    // Success Flow

                    // 1. Deduct Balance
                    user.walletBalance -= totalAmount;
                    await user.save();

                    // 2. Create Order
                    const newOrder = new Order({
                        userId: sub.userId,
                        items: orderItems,
                        totalAmount,
                        shippingAddress: sub.deliveryAddress, // Assuming ID is stored or we need to fetch object? Model says ID usually.
                        paymentMethod: 'Wallet',
                        status: 'Processing',
                        paymentStatus: 'Paid',
                        orderType: 'subscription',
                        subscriptionId: sub._id,
                        deliverySlot: 'Daily by 9:00 AM'
                    });
                    await newOrder.save();

                    // 3. Create Transaction
                    await Transaction.create({
                        userId: sub.userId,
                        amount: totalAmount,
                        type: 'debit',
                        description: `Auto-Subscription #${sub._id} (Order #${newOrder._id})`,
                        status: 'success'
                    });

                    // 4. Update Next Delivery Date
                    const currentNextDate = new Date(sub.nextDeliveryDate);
                    let newNextDate = new Date(currentNextDate);

                    switch (sub.frequency) {
                        case 'daily': newNextDate.setDate(currentNextDate.getDate() + 1); break;
                        case 'weekly': newNextDate.setDate(currentNextDate.getDate() + 7); break;
                        case 'monthly': newNextDate.setMonth(currentNextDate.getMonth() + 1); break;
                        default: newNextDate.setMonth(currentNextDate.getMonth() + 1);
                    }

                    sub.nextDeliveryDate = newNextDate;
                    await sub.save();

                    console.log(`Processed Subscription ${sub._id}: Success`);

                } else {
                    // Failure Flow: Insufficient Funds
                    // For now, we can skip or mark as 'Paused' or log a failed transaction attempt.
                    // Let's create a failed transaction log so user knows.
                    await Transaction.create({
                        userId: sub.userId,
                        amount: totalAmount,
                        type: 'debit',
                        description: `Auto-Subscription Failed: Insufficient Fund`,
                        status: 'failed'
                    });

                    console.log(`Processed Subscription ${sub._id}: Failed (Insufficient Funds)`);

                    // Optional: Pause subscription?
                    // sub.status = 'Paused';
                    // await sub.save();
                }

            } catch (err) {
                console.error(`Error processing subscription ${sub._id}:`, err);
            }
        }

    } catch (err) {
        console.error('Subscription Cron Job Error:', err);
    }
};

// Run at 09:00 AM every day
// const task = cron.schedule('0 9 * * *', processSubscriptions);

// For Demo/Testing: Run every 1 minute to show user it works? 
// Or stick to midnight. User asked for "daily".
// I'll export a function to init it.

const initCron = () => {
    // Running at 9 AM daily
    cron.schedule('0 9 * * *', processSubscriptions);
    console.log('Subscription Cron Job Scheduled (Daily at 09:00 AM)');
};

module.exports = { initCron, processSubscriptions };
