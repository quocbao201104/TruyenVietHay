/**
 * XSS Sanitization Utility
 * Strips HTML tags and dangerous patterns from user input
 */

/**
 * Remove HTML tags from a string to prevent XSS
 * @param {string} str - Input string to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeText = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/<[^>]*>/g, '')          // Strip HTML tags
    .replace(/javascript:/gi, '')      // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '')        // Remove event handlers (onclick=, etc.)
    .replace(/&lt;/g, '<')             // Decode then re-sanitize
    .replace(/<[^>]*>/g, '')           // Strip again after decode
    .trim();
};

/**
 * Sanitize an object's specified fields in-place
 * @param {Object} obj - Object to sanitize
 * @param {string[]} fields - Field names to sanitize
 * @returns {Object} Same object with sanitized fields
 */
const sanitizeFields = (obj, fields) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const field of fields) {
    if (obj[field] && typeof obj[field] === 'string') {
      obj[field] = sanitizeText(obj[field]);
    }
  }
  return obj;
};

module.exports = { sanitizeText, sanitizeFields };
