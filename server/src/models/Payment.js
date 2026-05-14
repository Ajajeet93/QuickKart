const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: {
        type: String,
        enum: ['Pending', 'Succeeded', 'Failed'],
        required: true
    },
    method: { type: String, default: 'Credit Card' },
    transactionId: { type: String } // Stripe PaymentIntent ID
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
