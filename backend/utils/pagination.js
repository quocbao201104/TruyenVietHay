/**
 * Pagination Utility
 * Provides helper functions for consistent pagination
 */

const getPaginationParams = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Validate parameters
  if (page < 1 || limit < 1 || limit > 100) {
    throw new Error('Invalid pagination parameters');
  }

  return { page, limit, offset };
};

const buildPaginationMeta = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

module.exports = {
  getPaginationParams,
  buildPaginationMeta,
};
