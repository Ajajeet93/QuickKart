const supportService  = require('./support.service');
const catchAsync      = require('../../core/errors/CatchAsync');
const { success, created } = require('../../core/utils/apiResponse');

exports.createRequest = catchAsync(async (req, res) => {
    const request = await supportService.createRequest(
        req.user.id,
        req.user.role === 'admin',
        req.body,
    );
    created(res, 'Support request submitted', request);
});

exports.getRequestsByOrder = catchAsync(async (req, res) => {
    const requests = await supportService.getRequestsByOrder(req.params.orderId, req.user.id);
    success(res, 200, 'Requests fetched', requests);
});

exports.getMyRequests = catchAsync(async (req, res) => {
    const requests = await supportService.getMyRequests(req.user.id);
    success(res, 200, 'Your support requests', requests);
});

exports.updateRequestStatus = catchAsync(async (req, res) => {
    const request = await supportService.updateRequestStatus(req.params.id, req.body);
    success(res, 200, 'Request status updated', request);
});
