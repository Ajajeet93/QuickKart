/**
 * apiResponse — standardised JSON response shapes.
 *
 * DRY: Every controller calls these helpers instead of hand-crafting
 * its own `res.json({ message, data })` objects.
 *
 * SOLID / OCP: Add new response types here without changing controllers.
 */

/**
 * Send a successful response.
 * @param {Response} res  - Express response object
 * @param {number}   statusCode - HTTP status code (default 200)
 * @param {string}   message    - Human-readable success message
 * @param {*}        data       - Payload to include (optional)
 */
const success = (res, statusCode = 200, message = 'Success', data = undefined) => {
    const body = { success: true, message };
    if (data !== undefined) body.data = data;
    return res.status(statusCode).json(body);
};

/**
 * Send a created (201) response.
 */
const created = (res, message = 'Created successfully', data = undefined) =>
    success(res, 201, message, data);

/**
 * Send a paginated list response.
 */
const paginated = (res, message = 'Fetched successfully', { data, total, page, pages }) =>
    res.status(200).json({ success: true, message, data, meta: { total, page, pages } });

module.exports = { success, created, paginated };
