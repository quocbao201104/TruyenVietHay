const express = require('express');
const router = express.Router();
const { getStats, invalidate } = require('../utils/cache');

/**
 * Cache Monitoring Endpoints
 * 
 * These endpoints allow administrators to monitor and manage the cache
 * Use for debugging and performance optimization
 */

// GET /admin/cache/stats - View cache statistics
router.get('/cache/stats', (req, res) => {
  try {
    const stats = getStats();
    res.json({
      success: true,
      cacheStats: stats,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cache statistics',
    });
  }
});

// POST /admin/cache/flush - Clear entire cache
router.post('/cache/flush', (req, res) => {
  try {
    invalidate(); // No pattern = flush all
    res.json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error) {
    console.error('Error flushing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to flush cache',
    });
  }
});

// POST /admin/cache/invalidate - Invalidate specific cache pattern
router.post('/cache/invalidate', (req, res) => {
  try {
    const { pattern } = req.body;
    
    if (!pattern) {
      return res.status(400).json({
        success: false,
        message: 'Pattern is required',
      });
    }

    invalidate(pattern);
    res.json({
      success: true,
      message: `Cache keys matching "${pattern}" invalidated`,
    });
  } catch (error) {
    console.error('Error invalidating cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to invalidate cache',
    });
  }
});

module.exports = router;
