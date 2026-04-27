const cron = require('node-cron');
const Order = require('../models/Order');

// Absolute Time Thresholds (in Minutes from Creation)
const TIMELINE = {
    TO_PACKING: 0.5,   
    TO_SHIPPING: 2.5,  
    TO_DELIVERY: 12.5  
};

const simulateOrderProgression = async () => {
    try {
        const now = new Date();

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

          
            if (ageInMinutes >= TIMELINE.TO_DELIVERY) {
                targetStatus = 'Delivered';
            } else if (ageInMinutes >= TIMELINE.TO_SHIPPING) {
                targetStatus = 'Shipped';
            } else if (ageInMinutes >= TIMELINE.TO_PACKING) {
                targetStatus = 'Processing';
            }

            const statusRank = { 'Pending': 0, 'Processing': 1, 'Shipped': 2, 'Delivered': 3 };

            if (statusRank[targetStatus] > statusRank[order.status]) {
                order.status = targetStatus;

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
