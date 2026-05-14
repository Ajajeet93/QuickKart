const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String, required: true }, // Emoji or Icon name
    color: { type: String, required: true }, // Hex colour string
    image: { type: String }, // Optional background image
    description: { type: String }, // Optional short description for storefront
});

module.exports = mongoose.model('Category', categorySchema);
