const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            variant: {
                weight: { type: String, required: true },
                price: { type: Number, required: true }
            }
        }
    ],
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure virtuals are included if we ever JSON stringify directly
CartSchema.set('toJSON', { virtuals: true });
CartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', CartSchema);
