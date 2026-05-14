const express = require('express');
const categoriesController = require('./categories.controller');
const validateRequest = require('../../core/middlewares/validateRequest');
const { createCategorySchema, updateCategorySchema } = require('./categories.validation');
const { isAdminAuthenticated } = require('../../core/middlewares/auth');

const router = express.Router();

// Public routes
router.get('/', categoriesController.getAllCategories);
router.get('/:id', categoriesController.getCategoryById);

// Admin routes
router.post('/', isAdminAuthenticated, validateRequest(createCategorySchema), categoriesController.createCategory);
router.put('/:id', isAdminAuthenticated, validateRequest(updateCategorySchema), categoriesController.updateCategory);
router.delete('/:id', isAdminAuthenticated, categoriesController.deleteCategory);

module.exports = router;
