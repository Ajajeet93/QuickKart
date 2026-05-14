const Product = require('../../models/Product');

class ProductsRepository {
    async countProducts(query) {
        return await Product.countDocuments(query);
    }

    async findProducts(query, skip, limit) {
        return await Product.find(query)
            .populate('categoryId', 'name icon color')
            .skip(skip)
            .limit(limit);
    }

    async findProductById(id) {
        return await Product.findById(id).populate('categoryId', 'name icon color');
    }

    async createProduct(productData) {
        const product = new Product(productData);
        return await product.save();
    }

    async updateProduct(id, updateData) {
        return await Product.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteProduct(id) {
        return await Product.findByIdAndDelete(id);
    }
}

module.exports = new ProductsRepository();
