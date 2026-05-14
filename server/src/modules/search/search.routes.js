const express     = require('express');
const router      = express.Router();
const Product     = require('../../models/Product');
const Category    = require('../../models/Category');
const catchAsync  = require('../../core/errors/CatchAsync');
const { escapeRegex } = require('../../core/utils/sanitize');
const { success } = require('../../core/utils/apiResponse');

/**
 * GET /api/v1/search?q=<term>&limit=<n>
 *
 * Searches products and categories by name.
 * Uses escapeRegex() from shared sanitize utility to prevent ReDoS.
 */
router.get('/', catchAsync(async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
        return success(res, 200, 'No query provided', { products: [], categories: [], total: 0 });
    }

    const limit  = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 5));
    const regex  = new RegExp(escapeRegex(q.trim()), 'i');

    const [products, total, categories] = await Promise.all([
        Product.find({ name: regex }).select('name category image price _id').limit(limit),
        Product.countDocuments({ name: regex }),
        Category.find({ name: regex }).select('name icon color _id').limit(limit),
    ]);

    success(res, 200, 'Search results', { products, categories, total });
}));

module.exports = router;
