/**
 * paginate — reusable Mongoose pagination helper.
 *
 * DRY: Eliminates the page/limit/skip calculation repeated across
 *      every admin route, product route, and search endpoint.
 *
 * Usage:
 *   const result = await paginate(Product, filter, req.query);
 *   // result = { data, total, page, pages }
 *
 * @param {Model}  Model   - Mongoose model class
 * @param {Object} filter  - Mongoose query filter
 * @param {Object} query   - Express req.query (must have page, limit)
 * @param {Object} options - { populate, select, sort }
 */
const paginate = async (Model, filter = {}, query = {}, options = {}) => {
    const page  = Math.max(1, parseInt(query.page,  10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip  = (page - 1) * limit;

    const { populate, select, sort = { createdAt: -1 } } = options;

    let dbQuery = Model.find(filter).sort(sort).skip(skip).limit(limit);

    if (select)   dbQuery = dbQuery.select(select);
    if (populate) {
        const pops = Array.isArray(populate) ? populate : [populate];
        pops.forEach(p => { dbQuery = dbQuery.populate(p); });
    }

    const [data, total] = await Promise.all([
        dbQuery.exec(),
        Model.countDocuments(filter),
    ]);

    return { data, total, page, pages: Math.ceil(total / limit) };
};

module.exports = { paginate };
