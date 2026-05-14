const express          = require('express');
const supportController = require('./support.controller');
const validateRequest  = require('../../core/middlewares/validateRequest');
const { isAuthenticated, isAdmin } = require('../../core/middlewares/auth');
const { createSupportRequestSchema, updateStatusSchema } = require('./support.validation');

const router = express.Router();

router.use(isAuthenticated);

router.post('/request',      validateRequest(createSupportRequestSchema), supportController.createRequest);
router.get('/order/:orderId',                                              supportController.getRequestsByOrder);
router.get('/my',                                                          supportController.getMyRequests);

// Admin only
router.put('/:id/status', isAdmin, validateRequest(updateStatusSchema), supportController.updateRequestStatus);

module.exports = router;
