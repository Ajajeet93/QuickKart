const { z } = require('zod');

const createSubscriptionSchema = {
    body: z.object({
        items: z.array(z.object({
            product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID'),
            quantity: z.number().int().positive(),
            variant: z.object({
                weight: z.string().optional(),
                price: z.number().optional()
            }).optional()
        })).min(1, 'Subscription must contain at least one item'),
        // Accept both lowercase and capitalized frequency values
        frequency: z.enum(['daily', 'weekly', 'monthly', 'Daily', 'Weekly', 'Bi-Weekly', 'Monthly']),
        deliveryAddressId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Address ID'),
        startDate: z.string().optional(),
        forceMerge: z.boolean().optional(),
        paymentMethod: z.string().optional()
    })
};

const updateSubscriptionStatusSchema = {
    body: z.object({
        status: z.enum(['Active', 'Paused', 'Cancelled']),
    })
};

// For PATCH /:id — flexible update (status, quantity, frequency, address)
const updateSubscriptionSchema = {
    body: z.object({
        status: z.enum(['Active', 'Paused', 'Cancelled']).optional(),
        quantity: z.number().int().positive().optional(),
        frequency: z.enum(['daily', 'weekly', 'monthly', 'Daily', 'Weekly', 'Bi-Weekly', 'Monthly']).optional(),
        deliveryAddressId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Address ID').optional(),
    })
};

module.exports = {
    createSubscriptionSchema,
    updateSubscriptionStatusSchema,
    updateSubscriptionSchema,
};
