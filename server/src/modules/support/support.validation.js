const { z } = require('zod');

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const createSupportRequestSchema = {
    body: z.object({
        orderId:     mongoId,
        items:       z.array(z.object({ productId: mongoId, quantity: z.number().int().positive() })).min(1),
        type:        z.enum(['Return', 'Replacement']),
        reason:      z.enum(['damaged', 'wrong_item', 'not_as_described', 'changed_mind', 'missing_item', 'other']),
        description: z.string().max(2000).optional(),
    }),
};

const updateStatusSchema = {
    params: z.object({ id: mongoId }),
    body: z.object({
        status:        z.enum(['Pending', 'Approved', 'Rejected', 'Completed']),
        adminResponse: z.string().max(2000).optional(),
    }),
};

module.exports = { createSupportRequestSchema, updateStatusSchema };
