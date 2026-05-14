const categoriesService = require('./categories.service');
const catchAsync = require('../../core/errors/CatchAsync');

exports.getAllCategories = catchAsync(async (req, res) => {
    const categories = await categoriesService.getAllCategories();
    res.status(200).json(categories);
});

exports.getCategoryById = catchAsync(async (req, res) => {
    const category = await categoriesService.getCategoryById(req.params.id);
    res.status(200).json(category);
});

exports.createCategory = catchAsync(async (req, res) => {
    const category = await categoriesService.createCategory(req.body);
    res.status(201).json(category);
});

exports.updateCategory = catchAsync(async (req, res) => {
    const category = await categoriesService.updateCategory(req.params.id, req.body);
    res.status(200).json(category);
});

exports.deleteCategory = catchAsync(async (req, res) => {
    await categoriesService.deleteCategory(req.params.id);
    res.status(200).json({ message: 'Category deleted' });
});
