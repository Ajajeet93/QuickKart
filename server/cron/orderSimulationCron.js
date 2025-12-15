const cron = require('node-cron');
const Order = require('../models/Order');

// Absolute Time Thresholds (in Minutes from Creation)
const TIMELINE = {
    TO_PACKING: 0.5,   // Moves to Processing after 30s
    TO_SHIPPING: 2.5,  // Moves to Shipped after 2m Packing (0.5 + 2)
    TO_DELIVERY: 12.5  // Moves to Delivered after 10m Shipping (2.5 + 10)
};

const simulateOrderProgression = async () => {
    try {
        const now = new Date();

        // Fetch all active (non-delivered/cancelled) orders
        // We fetch ALL because we need to check their absolute age
        const activeOrders = await Order.find({
            status: { $in: ['Pending', 'Processing', 'Shipped'] }
        });

        console.log(`[Simulation] Tick: Found ${activeOrders.length} active orders.`);

        for (const order of activeOrders) {
            const createdTime = new Date(order.createdAt);
            if (isNaN(createdTime.getTime())) {
                console.error(`[Simulation] Invalid CreatedAt for order ${order._id}`);
                continue;
            }

            const ageInMinutes = (now - createdTime) / 60000;
            let targetStatus = order.status;

            // Determine correct status based on absolute age
            // Order: Pending (0-0.5) -> Processing (0.5-2.5) -> Shipped (2.5-12.5) -> Delivered (12.5+)
            if (ageInMinutes >= TIMELINE.TO_DELIVERY) {
                targetStatus = 'Delivered';
            } else if (ageInMinutes >= TIMELINE.TO_SHIPPING) {
                targetStatus = 'Shipped';
            } else if (ageInMinutes >= TIMELINE.TO_PACKING) {
                targetStatus = 'Processing';
            }

            // console.log(`[Simulation Debug] Order ${order._id}: Age=${ageInMinutes.toFixed(2)}m, Current=${order.status}, Target=${targetStatus}`);

            // Apply Update if Status Changed
            // Also ensure we don't regress status (e.g. manually set advanced status)
            // But since this is a simulation demo, strict time adherence is usually preferred.
            // We'll prevent regression just in case.
            const statusRank = { 'Pending': 0, 'Processing': 1, 'Shipped': 2, 'Delivered': 3 };

            if (statusRank[targetStatus] > statusRank[order.status]) {
                order.status = targetStatus;

                // Auto-pay if moving past pending
                if (order.status !== 'Pending' && order.paymentStatus === 'Pending') {
                    order.paymentStatus = 'Paid';
                }

                await order.save();
                console.log(`[Simulation UPDATE] Order ${order._id} moved to ${targetStatus} (Age: ${ageInMinutes.toFixed(2)}m)`);
            }
        }

    } catch (err) {
        console.error('Order Simulation Error:', err);
    }
};

const initSimulationCron = () => {
    // Run every 10 seconds
    cron.schedule('*/10 * * * * *', simulateOrderProgression);
    console.log('Order Status Simulation Cron Started (Absolute Time Mode)');
    console.log(`Timeline: Pack @ ${TIMELINE.TO_PACKING}m, Ship @ ${TIMELINE.TO_SHIPPING}m, Deliver @ ${TIMELINE.TO_DELIVERY}m`);
};

module.exports = { initSimulationCron, simulateOrderProgression };
