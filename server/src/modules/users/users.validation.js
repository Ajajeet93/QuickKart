const { z } = require('zod');

const createUserSchema = {
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email format'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        role: z.enum(['user', 'admin']).optional(),
        phone: z.string().optional(),
    }),
};

const addressSchema = {
    body: z.object({
        street: z.string().min(1, 'Street is required'),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        zip: z.string().min(1, 'Zip code is required'),
        country: z.string().min(1, 'Country is required'),
        isDefault: z.boolean().optional(),
        type: z.enum(['Home', 'Work', 'Other']).optional(),
    }),
};

const updateAddressSchema = {
    body: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        country: z.string().optional(),
        isDefault: z.boolean().optional(),
        type: z.enum(['Home', 'Work', 'Other']).optional(),
    }).refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided to update",
    }),
};

module.exports = {
    createUserSchema,
    addressSchema,
    updateAddressSchema,
};
