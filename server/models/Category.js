const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String, required: true }, // Emoji or Icon name
    color: { type: String, required: true }, // Tailwind class string
    image: { type: String } // Optional background image
});

module.exports = mongoose.model('Category', categorySchema);
