const Order         = require('../../models/Order');
const ReturnRequest = require('../../models/ReturnRequest');

class SupportRepository {
    findOrderForUser(orderId, userId, isAdmin) {
        const query = { _id: orderId };
        if (!isAdmin) query.userId = userId;
        return Order.findOne(query);
    }

    createRequest(data)   { return ReturnRequest.create(data); }

    findRequestsByOrder(orderId, userId) {
        return ReturnRequest.find({ orderId, userId });
    }

    findRequestsByUser(userId) {
        return ReturnRequest.find({ userId })
            .populate('orderId')
            .populate('items.productId', 'name image')
            .sort({ createdAt: -1 });
    }

    updateRequest(id, data) {
        return ReturnRequest.findByIdAndUpdate(id, data, { new: true });
    }
}

module.exports = new SupportRepository();
