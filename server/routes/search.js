const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

// GET /api/search?q=query
router.get('/', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length === 0) {
            return res.json({ products: [], categories: [] });
        }

        const regex = new RegExp(q, 'i');

        // Run queries in parallel for performance
        const [products, totalProducts, categories] = await Promise.all([
            Product.find({ name: regex })
                .select('name category image price _id')
                .limit(3), // Limit strictly to 3 as requested
            Product.countDocuments({ name: regex }),
            Category.find({ name: regex })
                .select('name icon color _id')
                .limit(3)
        ]);

        res.json({ products, categories, totalProducts });
    } catch (err) {
        console.error('Search Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
