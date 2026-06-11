const { z } = require('zod');

const createOrderSchema = {
    body: z.object({
        items: z.array(z.object({
            product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID').optional(),
            productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID').optional(),
            quantity: z.number().int().positive(),
            variant: z.object({
                weight: z.string(),
                // NOTE: price is intentionally excluded — server always fetches price from DB
                // Any client-sent price is ignored to prevent price tampering
            }).optional()
        })).min(1, 'Order must contain at least one item'),
        shippingAddressId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Address ID'),
        paymentMethod: z.enum(['Wallet', 'Credit Card', 'Cash on Delivery', 'Stripe']),
        // NOTE: totalAmount is intentionally excluded — server always recalculates from DB prices
        // Any client-sent totalAmount is ignored to prevent total tampering
    })
};

const updateOrderStatusSchema = {
    body: z.object({
        status: z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']),
    })
};

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema,
};
