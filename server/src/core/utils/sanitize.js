/**
 * sanitize — text sanitisation helpers.
 *
 * DRY: Single source of truth for stripping HTML/XSS content.
 *      Extracted from routes/support.js so any module can import it.
 */

/**
 * Remove HTML tags and common HTML entities from a string.
 * @param {string} str
 * @param {number} maxLength - hard cap on output length (default 2000)
 * @returns {string}
 */
const stripHtml = (str, maxLength = 2000) => {
    if (typeof str !== 'string') return '';
    return str
        .replace(/<[^>]*>/g, '')        // remove HTML tags
        .replace(/&[a-z]+;/gi, ' ')     // replace HTML entities
        .replace(/\s+/g, ' ')           // collapse whitespace
        .trim()
        .slice(0, maxLength);
};

/**
 * Escape special regex characters in a user-supplied string.
 * Use before passing user input to `new RegExp(...)`.
 * @param {string} str
 * @returns {string}
 */
const escapeRegex = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = { stripHtml, escapeRegex };
