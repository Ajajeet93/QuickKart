const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }, // Legacy/Single link
    subscriptionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }], // New: Multiple subscriptions link
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Price at purchase time
        weight: { type: String } // Snapshot of variant weight
    }],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    paymentMethod: { type: String, default: 'Credit Card' },
    orderType: {
        type: String,
        enum: ['one-time', 'subscription'],
        default: 'one-time'
    },
    deliverySlot: { type: String }
}, { timestamps: true });

// Indexes for performance (especially for the simulation cron job)
orderSchema.index({ status: 1, createdAt: 1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
