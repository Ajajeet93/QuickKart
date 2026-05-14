const express = require('express');
const productsController = require('./products.controller');
const validateRequest = require('../../core/middlewares/validateRequest');
const { createProductSchema, updateProductSchema, getProductsQuerySchema } = require('./products.validation');
const { isAdminAuthenticated } = require('../../core/middlewares/auth');

const router = express.Router();

// Public routes
router.get('/', validateRequest(getProductsQuerySchema), productsController.getProducts);
router.get('/:id', productsController.getProductById);

// Admin routes
router.post('/', isAdminAuthenticated, validateRequest(createProductSchema), productsController.createProduct);
router.put('/:id', isAdminAuthenticated, validateRequest(updateProductSchema), productsController.updateProduct);
router.delete('/:id', isAdminAuthenticated, productsController.deleteProduct);

module.exports = router;
