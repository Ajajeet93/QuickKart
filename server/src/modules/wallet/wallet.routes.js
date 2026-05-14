const express = require('express');
const walletController = require('./wallet.controller');
const validateRequest = require('../../core/middlewares/validateRequest');
const { addMoneySchema, addCardSchema } = require('./wallet.validation');
const { isAuthenticated } = require('../../core/middlewares/auth');

const router = express.Router();

router.use(isAuthenticated);

router.get('/', walletController.getWallet);
router.post('/add', validateRequest(addMoneySchema), walletController.addMoney);

router.get('/cards', walletController.getSavedCards);
router.post('/cards', validateRequest(addCardSchema), walletController.addSavedCard);
router.delete('/cards/:id', walletController.deleteSavedCard);

module.exports = router;
