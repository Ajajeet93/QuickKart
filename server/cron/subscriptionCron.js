const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');

const processSubscriptions = async (simulatedDate = null) => {
    console.log('Running Subscription Cron Job:', simulatedDate || new Date().toISOString());

    try {
        const today = simulatedDate ? new Date(simulatedDate) : new Date();
        today.setHours(0, 0, 0, 0);

        // Find all active subscriptions due today or before (catch-up)
        const subscriptions = await Subscription.find({
            status: 'Active',
            nextDeliveryDate: { $lte: today },
        }).populate('items.product');

        console.log(`Found ${subscriptions.length} due subscriptions.`);

        for (const sub of subscriptions) {
            try {
                let totalAmount = 0;
                const orderItems = [];

                for (const item of sub.items) {
                    const product = item.product; // populated
                    if (!product) continue;

                    // Bug Fix 1: Use variant price if available, fallback to base product price
                    const basePrice = (item.variant && item.variant.price)
                        ? item.variant.price
                        : product.price;
                    const discountedPrice = basePrice * 0.85; // 15% subscription discount

                    totalAmount += discountedPrice * item.quantity;

                    orderItems.push({
                        product:  product._id,
                        quantity: item.quantity,
                        price:    discountedPrice,
                        weight:   item.variant?.weight || null, // Bug Fix 4: include variant weight
                    });
                }

                if (totalAmount === 0) {
                    console.log(`Skipping Subscription ${sub._id}: calculated amount is 0`);
                    continue;
                }

                const user = await User.findById(sub.userId);
                if (!user) {
                    console.log(`Skipping Subscription ${sub._id}: user not found`);
                    continue;
                }

                if (user.walletBalance >= totalAmount) {
                    // ── SUCCESS FLOW ──────────────────────────────────────

                    // 1. Deduct wallet balance
                    user.walletBalance -= totalAmount;
                    await user.save();

                    // 2. Create Order
                    const newOrder = new Order({
                        userId:          sub.userId,
                        items:           orderItems,
                        totalAmount,
                        shippingAddress: sub.deliveryAddress,
                        status:          'Processing',
                        paymentStatus:   'Paid',
                        paymentMethod:   'Wallet',
                        orderType:       'subscription',
                        subscriptionId:  sub._id,                 // legacy field
                        subscriptionIds: [sub._id],               // Bug Fix 2: also set array field (used by history query)
                        deliverySlot:    'Daily by 9:00 AM',
                    });
                    await newOrder.save();

                    // 3. Create Transaction
                    await Transaction.create({
                        userId:      sub.userId,
                        amount:      totalAmount,
                        type:        'debit',
                        description: `Auto-Subscription #${sub._id} (Order #${newOrder._id})`,
                        status:      'success',
                    });

                    // 4. Advance nextDeliveryDate
                    const currentNextDate = new Date(sub.nextDeliveryDate);
                    const newNextDate = new Date(currentNextDate);

                    switch (sub.frequency) {
                        case 'daily':   newNextDate.setDate(currentNextDate.getDate() + 1);      break;
                        case 'weekly':  newNextDate.setDate(currentNextDate.getDate() + 7);      break;
                        case 'monthly': newNextDate.setMonth(currentNextDate.getMonth() + 1);    break;
                        default:        newNextDate.setMonth(currentNextDate.getMonth() + 1);
                    }

                    sub.nextDeliveryDate = newNextDate;
                    sub.lastDeliveryDate = today;  // Bug Fix 3: update lastDeliveryDate
                    await sub.save();

                    console.log(`✅ Subscription ${sub._id}: Processed (₹${totalAmount.toFixed(2)}) | Next: ${newNextDate.toDateString()}`);

                } else {
                    // ── FAILURE FLOW: Insufficient wallet ─────────────────
                    // nextDeliveryDate is NOT advanced — cron will retry next run
                    // (user must top up their wallet)

                    await Transaction.create({
                        userId:      sub.userId,
                        amount:      totalAmount,
                        type:        'debit',
                        description: `Auto-Subscription Failed: Insufficient funds for Sub #${sub._id}`,
                        status:      'failed',
                    });

                    console.log(`❌ Subscription ${sub._id}: Failed — Insufficient funds (need ₹${totalAmount.toFixed(2)}, have ₹${user.walletBalance.toFixed(2)})`);
                }

            } catch (err) {
                console.error(`Error processing subscription ${sub._id}:`, err);
            }
        }

    } catch (err) {
        console.error('Subscription Cron Job Error:', err);
    }
};

const initCron = () => {
    // Runs daily at 9:00 AM server time
    cron.schedule('0 9 * * *', processSubscriptions);
    console.log('Subscription Cron Job Scheduled (Daily at 09:00 AM)');
};

module.exports = { initCron, processSubscriptions };
