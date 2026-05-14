const express = require('express');
const subscriptionsController = require('./subscriptions.controller');
const validateRequest = require('../../core/middlewares/validateRequest');
const { createSubscriptionSchema, updateSubscriptionStatusSchema, updateSubscriptionSchema } = require('./subscriptions.validation');
const { isAuthenticated, isAdmin } = require('../../core/middlewares/auth');

const router = express.Router();

// User routes
router.post('/', isAuthenticated, validateRequest(createSubscriptionSchema), subscriptionsController.createSubscription);
router.get('/', isAuthenticated, subscriptionsController.getUserSubscriptions);
router.get('/:id', isAuthenticated, subscriptionsController.getSubscriptionById);
router.patch('/:id', isAuthenticated, validateRequest(updateSubscriptionSchema), subscriptionsController.updateSubscription);
router.delete('/:id', isAuthenticated, subscriptionsController.deleteSubscription);

// Legacy status-only update route
router.put('/:id/status', isAuthenticated, validateRequest(updateSubscriptionStatusSchema), subscriptionsController.updateSubscriptionStatus);

// Admin routes (Manual Cron Trigger)
router.post('/admin/force-run', isAuthenticated, isAdmin, subscriptionsController.forceRunSubscriptions);

module.exports = router;
