const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'success'
    },
    // FIX: Store the external payment ID to detect replay attacks on wallet top-ups
    paymentId: { type: String },
}, { timestamps: true });

// Unique index on paymentId (sparse = only indexed when present, allows null)
transactionSchema.index({ paymentId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Transaction', transactionSchema);
