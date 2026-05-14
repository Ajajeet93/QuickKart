const { z } = require('zod');

const addToCartSchema = {
    body: z.object({
        productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID'),
        quantity: z.number().int().positive().optional(),
        variant: z.object({
            weight: z.string(),
            price: z.number()
        })
    })
};

const updateCartSchema = {
    body: z.object({
        productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID'),
        quantity: z.number().int().nonnegative(),
        weight: z.string()
    })
};

const removeFromCartSchema = {
    query: z.object({
        weight: z.string()
    })
};

module.exports = {
    addToCartSchema,
    updateCartSchema,
    removeFromCartSchema,
};
