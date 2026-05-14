const Category = require('../../models/Category');

class CategoriesRepository {
    async findAllCategories() {
        return await Category.find();
    }

    async findCategoryById(id) {
        return await Category.findById(id);
    }

    async createCategory(categoryData) {
        const category = new Category(categoryData);
        return await category.save();
    }

    async updateCategory(id, updateData) {
        return await Category.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteCategory(id) {
        return await Category.findByIdAndDelete(id);
    }
}

module.exports = new CategoriesRepository();
