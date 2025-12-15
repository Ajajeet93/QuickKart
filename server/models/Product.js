const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true }, // Base/Display Price
    variants: [{
        weight: { type: String, required: true },
        price: { type: Number, required: true }
    }],
    description: { type: String },
    category: { type: String, required: true }, // Legacy string, kept for now or migrate to ID
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // New ref per spec
    rating: { type: Number, default: 0 },
    image: { type: String }, // Main image
    images: [{ type: String }], // Array for details page
    stock: { type: Number, default: 100 },
    isPopular: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
