const { ZodError } = require('zod');
const { BadRequestError } = require('../errors/AppError');

/**
 * Validates request data against a Zod schema.
 * @param {Object} schema - Zod schema object with optional body, query, and params schemas.
 */
const validateRequest = (schema) => (req, res, next) => {
    try {
        if (schema.body) {
            req.body = schema.body.parse(req.body);
        }
        if (schema.query) {
            req.query = schema.query.parse(req.query);
        }
        if (schema.params) {
            req.params = schema.params.parse(req.params);
        }
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
            return next(new BadRequestError(`Validation Error: ${errorMessage}`));
        }
        next(error);
    }
};

module.exports = validateRequest;
