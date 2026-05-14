const { z } = require('zod');

const createProductSchema = {
    body: z.object({
        name: z.string().min(2, 'Name is required'),
        description: z.string().min(10, 'Description must be at least 10 characters'),
        price: z.number().positive('Price must be positive'),
        image: z.string().url('Invalid image URL'),
        category: z.string().min(2, 'Category name is required'),
        categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Category ID'),
        stock: z.number().int().nonnegative('Stock must be a non-negative integer'),
        variants: z.array(z.object({
            weight: z.string(),
            price: z.number().positive(),
            stock: z.number().int().nonnegative()
        })).optional(),
        isSubscriptionAvailable: z.boolean().optional(),
    }),
};

const updateProductSchema = {
    body: createProductSchema.body.partial().refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided to update"
    }),
};

const getProductsQuerySchema = {
    query: z.object({
        category: z.string().optional(),
        categoryId: z.string().optional(),
        search: z.string().optional(),
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    }),
};

module.exports = {
    createProductSchema,
    updateProductSchema,
    getProductsQuerySchema
};
