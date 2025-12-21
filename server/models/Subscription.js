const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        variant: {
            weight: { type: String }, // Optional for simple products
            price: { type: Number }
        }
    }],
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Paused', 'Cancelled', 'Pending'],
        default: 'Pending'
    },
    deliveryAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
    nextDeliveryDate: { type: Date },
    lastDeliveryDate: { type: Date },
    paymentMethodId: { type: String } // Stripe PaymentMethod ID
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
