const categoriesRepository = require('./categories.repository');
const { NotFoundError } = require('../../core/errors/AppError');

class CategoriesService {
    async getAllCategories() {
        return await categoriesRepository.findAllCategories();
    }

    async getCategoryById(id) {
        const category = await categoriesRepository.findCategoryById(id);
        if (!category) {
            throw new NotFoundError('Category not found');
        }
        return category;
    }

    async createCategory(categoryData) {
        return await categoriesRepository.createCategory(categoryData);
    }

    async updateCategory(id, updateData) {
        const category = await categoriesRepository.updateCategory(id, updateData);
        if (!category) {
            throw new NotFoundError('Category not found');
        }
        return category;
    }

    async deleteCategory(id) {
        const category = await categoriesRepository.deleteCategory(id);
        if (!category) {
            throw new NotFoundError('Category not found');
        }
        return category;
    }
}

module.exports = new CategoriesService();
