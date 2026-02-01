const NodeCache = require('node-cache');

/**
 * In-Memory Cache for Story Data
 * 
 * Purpose: Reduce database load for frequently accessed, slow-changing data
 * Strategy: TTL-based expiration with manual invalidation on updates
 * 
 * Default Config:
 * - stdTTL: 300s (5 minutes) - default expiration
 * - checkperiod: 60s - automatic cleanup interval
 * - useClones: false - performance optimization (don't clone objects)
 */
const cache = new NodeCache({
  stdTTL: 300,        // 5 minutes default TTL
  checkperiod: 60,    // Check for expired keys every minute
  useClones: false,   // Return references (faster, but be careful with mutations)
});

/**
 * Get data from cache or fetch and store
 * 
 * @param {string} key - Cache key
 * @param {number} ttl - Time to live in seconds
 * @param {Function} fetchFn - Async function to fetch data on cache miss
 * @returns {Promise<any>} - Cached or fetched data
 */
const getOrSet = async (key, ttl, fetchFn) => {
  // Try to get from cache
  const cached = cache.get(key);
  if (cached !== undefined) {
    console.log(`✅ Cache HIT: ${key}`);
    return cached;
  }

  // Cache miss - fetch fresh data
  console.log(`❌ Cache MISS: ${key} - Fetching from database...`);
  const data = await fetchFn();
  
  // Store in cache with TTL
  cache.set(key, data, ttl);
  console.log(`💾 Cached: ${key} (TTL: ${ttl}s)`);
  
  return data;
};

/**
 * Invalidate cache entries by pattern or key
 * 
 * @param {string} pattern - Pattern to match keys (optional)
 *                           If provided, invalidates all matching keys
 *                           If omitted, flushes entire cache
 * 
 * Examples:
 *   invalidate('topView')     -> Deletes 'topView:5', 'topView:10', etc.
 *   invalidate('topView:5')   -> Deletes exact key 'topView:5'
 *   invalidate()              -> Clears all cache
 */
const invalidate = (pattern) => {
  if (pattern) {
    const keys = cache.keys();
    const matchingKeys = keys.filter(k => k.includes(pattern));
    
    if (matchingKeys.length > 0) {
      matchingKeys.forEach(k => cache.del(k));
      console.log(`🗑️  Invalidated ${matchingKeys.length} keys matching: ${pattern}`);
    }
  } else {
    cache.flushAll();
    console.log('🗑️  Flushed entire cache');
  }
};

/**
 * Get cache statistics
 * Useful for monitoring and debugging
 */
const getStats = () => {
  return {
    keys: cache.keys(),
    stats: cache.getStats(),
  };
};

module.exports = {
  cache,
  getOrSet,
  invalidate,
  getStats,
};
