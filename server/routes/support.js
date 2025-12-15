const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const ReturnRequest = require('../models/ReturnRequest');
const Order = require('../models/Order');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Create a return/replacement request
router.post('/request', isAuthenticated, async (req, res) => {
    try {
        const { orderId, items, type, reason, description } = req.body;

        // Verify order belongs to user (or user is admin)
        const query = { _id: orderId };
        if (req.user.role !== 'admin') {
            query.userId = req.user.id;
        }

        const order = await Order.findOne(query);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const newRequest = new ReturnRequest({
            userId: order.userId, // Use the order's user, not necessarily the logged-in user (if admin)
            orderId,
            items,
            type,
            reason,
            description
        });

        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get requests for a specific order (User)
router.get('/order/:orderId', isAuthenticated, async (req, res) => {
    try {
        const requests = await ReturnRequest.find({
            orderId: req.params.orderId,
            userId: req.user.id
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all requests for the authenticated user
router.get('/my', isAuthenticated, async (req, res) => {
    try {
        console.log('GET /api/support/my called');
        console.log('Authenticated User ID:', req.user.id);

        const requests = await ReturnRequest.find({ userId: req.user.id })
            .populate('orderId')
            .populate('items.productId', 'name image')
            .sort({ createdAt: -1 });

        console.log(`Found ${requests.length} requests for user ${req.user.id}`);
        res.json(requests);
    } catch (error) {
        console.error('Error in GET /api/support/my:', error);
        res.status(500).json({ message: error.message });
    }
});

// Admin: Get all requests
router.get('/admin/all', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const requests = await ReturnRequest.find({})
            .populate('userId', 'name email')
            .populate('orderId')
            .populate('items.productId', 'name image') // Assuming Product model has name and image
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Update request status
router.put('/admin/:id/status', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        const request = await ReturnRequest.findByIdAndUpdate(
            req.params.id,
            { status, adminResponse },
            { new: true }
        );
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
