const supportRepository = require('./support.repository');
const { NotFoundError } = require('../../core/errors/AppError');
const { stripHtml } = require('../../core/utils/sanitize');

class SupportService {
    async createRequest(userId, isAdmin, { orderId, items, type, reason, description }) {
        const order = await supportRepository.findOrderForUser(orderId, userId, isAdmin);
        if (!order) throw new NotFoundError('Order not found');

        return supportRepository.createRequest({
            userId:      order.userId,
            orderId,
            items,
            type,
            reason,
            description: stripHtml(description || ''),
        });
    }

    getRequestsByOrder(orderId, userId) {
        return supportRepository.findRequestsByOrder(orderId, userId);
    }

    getMyRequests(userId) {
        return supportRepository.findRequestsByUser(userId);
    }

    async updateRequestStatus(requestId, { status, adminResponse }) {
        const update = { status };
        if (adminResponse) update.adminResponse = stripHtml(adminResponse);

        const request = await supportRepository.updateRequest(requestId, update);
        if (!request) throw new NotFoundError('Support request not found');
        return request;
    }
}

module.exports = new SupportService();
