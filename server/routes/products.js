const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// GET All Categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET All Products (Optionally Filter by Category)
router.get('/products', async (req, res) => {
    try {
        const { category, categoryId, page = 1, limit = 12 } = req.query;
        let query = {};

        if (categoryId) {
            query.categoryId = categoryId;
        } else if (category) {
            query.category = { $regex: new RegExp(category, 'i') }; // Fallback to name regex
        }

        // Search functionality
        const { search } = req.query;
        if (search) {
            query.name = { $regex: new RegExp(search, 'i') };
        }

        // Convert page/limit to numbers
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('categoryId', 'name icon color')
            .skip(skip)
            .limit(limitNum);

        res.json({
            products,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET Single Product
router.get('/products/:id', async (req, res) => {
    try {
        // Mock Product for Demo Integration - REMOVED TO PREVENT CONFUSION
        // if (req.params.id === 'mock_prod_id') { ... }

        const product = await Product.findById(req.params.id).populate('categoryId', 'name icon color');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        // Handle CastError for invalid ObjectIds
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).json({ message: err.message });
    }
});

// ADMIN ROUTES

// Categories
router.post('/categories', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/categories/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(category);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/categories/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Products
router.post('/products', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/products/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/products/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
