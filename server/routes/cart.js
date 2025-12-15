const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product'); // To validate product exists
const { isAuthenticated } = require('../middleware/auth');

// GET /api/cart - Get user's cart
router.get('/', isAuthenticated, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id }).populate('items.product');

        if (!cart) {
            // If no cart exists, return empty one (don't necessarily create it yet)
            // Or create empty one
            cart = new Cart({ userId: req.user.id, items: [] });
            await cart.save();
        }
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/cart - Add item to cart (or update qty if exists)
router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const { productId, quantity, variant } = req.body;
        const qty = parseInt(quantity) || 1;

        if (!variant || !variant.weight || !variant.price) {
            return res.status(400).json({ message: 'Product variant (weight) is required' });
        }

        let cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [] });
        }

        // Check if product AND variant exists in cart
        const itemIndex = cart.items.findIndex(p =>
            p.product.toString() === productId && p.variant.weight === variant.weight
        );

        if (itemIndex > -1) {
            // Update quantity
            cart.items[itemIndex].quantity += qty;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity: qty,
                variant: variant
            });
        }

        cart.updatedAt = Date.now();
        await cart.save();
        // Return full cart populated
        await cart.populate('items.product');
        res.json(cart);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/cart/update - Update specific item quantity
router.put('/update', isAuthenticated, async (req, res) => {
    try {
        const { productId, quantity, weight } = req.body;
        const qty = parseInt(quantity);

        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        // Find by ProductID AND Weight
        const itemIndex = cart.items.findIndex(p =>
            p.product.toString() === productId && p.variant.weight === weight
        );

        if (itemIndex > -1) {
            if (qty <= 0) {
                // Remove item if qty is 0 or less
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity = qty;
            }
            cart.updatedAt = Date.now();
            await cart.save();
            await cart.populate('items.product');
            res.json(cart);
        } else {
            res.status(404).json({ message: 'Item not found in cart' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/cart/:productId - Remove item (Requires weight query param)
router.delete('/:productId', isAuthenticated, async (req, res) => {
    try {
        const { weight } = req.query; // Need weight to identify unique item
        if (!weight) return res.status(400).json({ message: 'Weight required to remove item' });

        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(item =>
            !(item.product.toString() === req.params.productId && item.variant.weight === weight)
        );

        cart.updatedAt = Date.now();
        await cart.save();
        await cart.populate('items.product');
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/cart/merge - Merge local cart (optional, for initial login sync)
router.put('/merge', isAuthenticated, async (req, res) => {
    try {
        const { items } = req.body; // Array of { productId, quantity }

        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [] });
        }

        items.forEach(localItem => {
            const itemIndex = cart.items.findIndex(p => p.product.toString() === localItem.productId);
            if (itemIndex > -1) {
                // Decide logic: Add, or Max? Let's just Add for now, or keep Max.
                // Safest is to just ensure they are present.
                // Let's increment.
                // cart.items[itemIndex].quantity += localItem.quantity; 
                // Actually, often logic is "local wins" or "server wins". 
                // Let's do nothing if exists, just add new ones. 
                // Or robust merge:
                // If exists, keep server qty (or max). If not, add.
            } else {
                cart.items.push({ product: localItem.productId, quantity: localItem.quantity });
            }
        });

        await cart.save();
        await cart.populate('items.product');
        res.json(cart);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
