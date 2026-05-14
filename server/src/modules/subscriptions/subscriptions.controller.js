const subscriptionsService = require('./subscriptions.service');
const catchAsync = require('../../core/errors/CatchAsync');

exports.createSubscription = catchAsync(async (req, res) => {
    const result = await subscriptionsService.createSubscription(req.user.id, req.body);
    if (result.status === 'conflict') {
        res.status(409).json(result);
    } else {
        res.status(201).json(result);
    }
});

exports.getUserSubscriptions = catchAsync(async (req, res) => {
    const subscriptions = await subscriptionsService.getUserSubscriptions(req.user.id);
    res.status(200).json(subscriptions);
});

exports.getSubscriptionById = catchAsync(async (req, res) => {
    const subscription = await subscriptionsService.getSubscriptionById(req.params.id, req.user.id);
    res.status(200).json(subscription);
});

exports.updateSubscription = catchAsync(async (req, res) => {
    const subscription = await subscriptionsService.updateSubscription(req.params.id, req.user.id, req.body);
    res.status(200).json(subscription);
});

exports.deleteSubscription = catchAsync(async (req, res) => {
    await subscriptionsService.deleteSubscription(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Subscription cancelled successfully' });
});

exports.updateSubscriptionStatus = catchAsync(async (req, res) => {
    const subscription = await subscriptionsService.updateSubscriptionStatus(
        req.params.id, 
        req.user.id, 
        req.body.status
    );
    res.status(200).json(subscription);
});

exports.forceRunSubscriptions = catchAsync(async (req, res) => {
    // Legacy support for manual testing of cron job.
    // Ideally this should trigger an internal worker.
    const { processSubscriptions } = require('../../../cron/subscriptionCron');
    const { date } = req.body; // YYYY-MM-DD
    if (!date) {
        return res.status(400).json({ message: 'Date is required' });
    }
    const result = await processSubscriptions(new Date(date));
    res.json({ message: 'Subscription processing completed', details: result });
});
