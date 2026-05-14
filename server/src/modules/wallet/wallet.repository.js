const User        = require('../../models/User');
const Transaction = require('../../models/Transaction');

class WalletRepository {
    findUserById(id)  { return User.findById(id); }
    saveUser(user)    { return user.save(); }

    findTransactionsByUserId(userId) {
        return Transaction.find({ userId }).sort({ createdAt: -1 });
    }

    findTransactionByPaymentId(paymentId) {
        return Transaction.findOne({ paymentId });
    }

    createTransaction(data) { return Transaction.create(data); }

    removeCardFromUser(userId, cardId) {
        return User.findByIdAndUpdate(
            userId,
            { $pull: { savedCards: { _id: cardId } } },
            { new: true }
        );
    }
}

module.exports = new WalletRepository();
