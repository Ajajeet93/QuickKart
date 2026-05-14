const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
    walletBalance: { type: Number, default: 0 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    savedCards: [{
        brand: String,
        last4: String,
        expMonth: String,
        expYear: String,
        cardHolder: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
