const productsService = require('./products.service');
const catchAsync = require('../../core/errors/CatchAsync');

exports.getProducts = catchAsync(async (req, res) => {
    const { category, categoryId, search, page = 1, limit = 12 } = req.query;
    
    const result = await productsService.getProducts(
        { category, categoryId, search },
        parseInt(page),
        parseInt(limit)
    );

    res.status(200).json(result);
});

exports.getProductById = catchAsync(async (req, res) => {
    const product = await productsService.getProductById(req.params.id);
    res.status(200).json(product);
});

exports.createProduct = catchAsync(async (req, res) => {
    const product = await productsService.createProduct(req.body);
    res.status(201).json(product);
});

exports.updateProduct = catchAsync(async (req, res) => {
    const product = await productsService.updateProduct(req.params.id, req.body);
    res.status(200).json(product);
});

exports.deleteProduct = catchAsync(async (req, res) => {
    await productsService.deleteProduct(req.params.id);
    res.status(200).json({ message: 'Product deleted' });
});
