const productsRepository = require('./products.repository');
const { NotFoundError } = require('../../core/errors/AppError');

class ProductsService {
    async getProducts(filters, page = 1, limit = 12) {
        const query = {};

        if (filters.categoryId) {
            query.categoryId = filters.categoryId;
        } else if (filters.category) {
            query.category = { $regex: new RegExp(filters.category, 'i') };
        }
        
        if (filters.search) {
            query.name = { $regex: new RegExp(filters.search, 'i') };
        }

        const skip = (page - 1) * limit;

        const [total, products] = await Promise.all([
            productsRepository.countProducts(query),
            productsRepository.findProducts(query, skip, limit)
        ]);

        return {
            products,
            total,
            page,
            pages: Math.ceil(total / limit)
        };
    }

    async getProductById(id) {
        const product = await productsRepository.findProductById(id);
        if (!product) {
            throw new NotFoundError('Product not found');
        }
        return product;
    }

    async createProduct(productData) {
        return await productsRepository.createProduct(productData);
    }

    async updateProduct(id, updateData) {
        const product = await productsRepository.updateProduct(id, updateData);
        if (!product) {
            throw new NotFoundError('Product not found');
        }
        return product;
    }

    async deleteProduct(id) {
        const product = await productsRepository.deleteProduct(id);
        if (!product) {
            throw new NotFoundError('Product not found');
        }
        return product;
    }
}

module.exports = new ProductsService();
