const { z } = require('zod');

// ── Shared Zod types ──────────────────────────────────────────────
const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const loginSchema = {
    body: z.object({
        email:    z.string().email('Invalid email format'),
        password: z.string().min(1, 'Password is required'),
    }),
};

const updateOrderStatusSchema = {
    params: z.object({ id: mongoId }),
    body: z.object({
        status: z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']).optional(),
        paymentStatus: z.enum(['Pending', 'Paid', 'Failed', 'Refunded']).optional(),
    }).refine(d => d.status || d.paymentStatus, { message: 'Provide at least status or paymentStatus' }),
};

const updateSupportStatusSchema = {
    params: z.object({ id: mongoId }),
    body: z.object({
        status:        z.enum(['Pending', 'Approved', 'Rejected', 'Completed']),
        adminResponse: z.string().max(2000).optional(),
    }),
};

const createUserSchema = {
    body: z.object({
        name:     z.string().min(2),
        email:    z.string().email(),
        password: z.string().min(8),
        role:     z.enum(['user', 'admin']).default('user'),
        phone:    z.string().optional(),
    }),
};

const paginationSchema = {
    query: z.object({
        page:  z.string().optional().transform(v => parseInt(v, 10) || 1),
        limit: z.string().optional().transform(v => Math.min(100, parseInt(v, 10) || 50)),
    }),
};

module.exports = {
    loginSchema,
    updateOrderStatusSchema,
    updateSupportStatusSchema,
    createUserSchema,
    paginationSchema,
};
