const walletService   = require('./wallet.service');
const catchAsync      = require('../../core/errors/CatchAsync');
const { success, created } = require('../../core/utils/apiResponse');

exports.getWallet = catchAsync(async (req, res) => {
    const data = await walletService.getWallet(req.user.id);
    success(res, 200, 'Wallet fetched', data);
});

exports.addMoney = catchAsync(async (req, res) => {
    const { amount, paymentId } = req.body;
    const data = await walletService.addMoney(req.user.id, amount, paymentId);
    created(res, 'Money added successfully', data);
});

exports.getSavedCards = catchAsync(async (req, res) => {
    const cards = await walletService.getSavedCards(req.user.id);
    success(res, 200, 'Cards fetched', cards);
});

exports.addSavedCard = catchAsync(async (req, res) => {
    const cards = await walletService.addSavedCard(req.user.id, req.body);
    created(res, 'Card saved', cards);
});

exports.deleteSavedCard = catchAsync(async (req, res) => {
    const cards = await walletService.deleteSavedCard(req.user.id, req.params.id);
    success(res, 200, 'Card removed', cards);
});
