const walletRepository = require('./wallet.repository');
const { NotFoundError, BadRequestError, ConflictError } = require('../../core/errors/AppError');

const MIN_TOPUP = 1;
const MAX_TOPUP = 50000;
const MAX_CARDS = 5;

/**
 * WalletService — wallet & saved-card business logic.
 *
 * Security rules applied:
 *  - Amount validated server-side (integer, min/max limits)
 *  - PaymentId checked for replay attacks
 *  - Max 5 saved cards per user
 */
class WalletService {

    async getWallet(userId) {
        const user = await walletRepository.findUserById(userId);
        if (!user) throw new NotFoundError('User not found');

        const transactions = await walletRepository.findTransactionsByUserId(userId);
        return { balance: user.walletBalance, transactions };
    }

    async addMoney(userId, amount, paymentId) {
        // Validate amount
        const parsedAmount = parseInt(amount, 10);
        if (isNaN(parsedAmount) || parsedAmount !== Number(amount) || parsedAmount < MIN_TOPUP || parsedAmount > MAX_TOPUP) {
            throw new BadRequestError(`Amount must be a whole number between ₹${MIN_TOPUP} and ₹${MAX_TOPUP}`);
        }

        // Replay attack prevention
        const existing = await walletRepository.findTransactionByPaymentId(paymentId);
        if (existing) throw new ConflictError('This payment has already been applied to the wallet');

        const user = await walletRepository.findUserById(userId);
        if (!user) throw new NotFoundError('User not found');

        user.walletBalance += parsedAmount;
        await walletRepository.saveUser(user);

        const transaction = await walletRepository.createTransaction({
            userId,
            amount:      parsedAmount,
            type:        'credit',
            description: 'Added money to wallet',
            paymentId,
        });

        return { balance: user.walletBalance, transaction };
    }

    async getSavedCards(userId) {
        const user = await walletRepository.findUserById(userId);
        if (!user) throw new NotFoundError('User not found');
        return user.savedCards || [];
    }

    async addSavedCard(userId, { brand, last4, expMonth, expYear, cardHolder }) {
        const user = await walletRepository.findUserById(userId);
        if (!user) throw new NotFoundError('User not found');

        if (user.savedCards.length >= MAX_CARDS) {
            throw new BadRequestError(`Maximum of ${MAX_CARDS} saved cards allowed`);
        }

        const exists = user.savedCards.some(c => c.last4 === String(last4) && c.brand === brand);
        if (exists) throw new ConflictError('Card already saved');

        user.savedCards.push({ brand, last4: String(last4), expMonth, expYear, cardHolder });
        await walletRepository.saveUser(user);
        return user.savedCards;
    }

    async deleteSavedCard(userId, cardId) {
        const user = await walletRepository.findUserById(userId);
        if (!user) throw new NotFoundError('User not found');
        if (!user.savedCards.id(cardId)) throw new NotFoundError('Card not found');

        user.savedCards.pull(cardId);
        await walletRepository.saveUser(user);
        return user.savedCards;
    }
}

module.exports = new WalletService();
