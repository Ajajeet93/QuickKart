const { z } = require('zod');

const registerSchema = {
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email format'),
        password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, 'Password must be at least 8 characters long, contain at least one letter, one number, and one special character.'),
        phone: z.string().optional(),
    }),
};

const loginSchema = {
    body: z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(1, 'Password is required'),
    }),
};

const updateProfileSchema = {
    body: z.object({
        name: z.string().min(2).optional(),
        phone: z.string().optional(),
    }),
};

module.exports = {
    registerSchema,
    loginSchema,
    updateProfileSchema,
};
