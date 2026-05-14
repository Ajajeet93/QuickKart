const { z } = require('zod');

const createCategorySchema = {
    body: z.object({
        name:        z.string().min(2, 'Category name must be at least 2 characters'),
        slug:        z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
        icon:        z.string().min(1, 'Icon emoji is required'),
        color:       z.string().regex(/^#[0-9A-Fa-f]{3,6}$/, 'Color must be a valid hex color (e.g. #DCFCE7)'),
        image:       z.string().url('Image must be a valid URL').optional(),
        description: z.string().max(500).optional(),
    }),
};

const updateCategorySchema = {
    body: createCategorySchema.body.partial().refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided to update"
    }),
};

module.exports = {
    createCategorySchema,
    updateCategorySchema,
};
