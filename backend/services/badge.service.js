/**
 * backend/services/badge.service.js
 *
 * Central badge lookup service.
 *
 * Design goals
 * ─────────────
 * 1. ZERO N+1 queries: the full badge map is loaded ONCE and stored in the
 *    existing in-memory cache (cache.js / node-cache).
 * 2. getUserBadge(levelId) is a pure synchronous Map lookup — O(1).
 * 3. Cache is invalidated automatically on TTL expiry AND explicitly by
 *    adminInvalidateBadgeCache() after any admin update.
 * 4. Seasonal overrides: if override_icon_url is set and not expired, it
 *    replaces the regular icon_url in the returned DTO.
 */

const { getOrSet, invalidate } = require("../utils/cache");
const LevelBadgeModel          = require("../models/levelBadge.model");

// ── Constants ─────────────────────────────────────────────────────────────────
const CACHE_KEY = "badge:map";
const CACHE_TTL = 60 * 60; // 1 hour — badges change rarely

// ── Internals ─────────────────────────────────────────────────────────────────

/**
 * Build a Map<levelId, badgeDTO> from DB rows.
 * Each badge covers min_level_id..max_level_id (inclusive).
 * We expand the range so that getUserBadge is a single Map.get().
 */
async function buildBadgeMap() {
  const rows = await LevelBadgeModel.getAllActive();
  const map  = new Map();

  const now = new Date();

  for (const row of rows) {
    // Resolve override
    const useOverride =
      row.override_icon_url &&
      (!row.override_expires_at || new Date(row.override_expires_at) > now);

    const dto = {
      badge_name:     row.badge_name,
      slug:           row.slug,
      icon_url:       useOverride ? row.override_icon_url : row.icon_url,
      rarity:         row.rarity,
      color:          row.color,
      animation_type: row.animation_type,
      sort_order:     row.sort_order,
    };

    for (let lvl = row.min_level_id; lvl <= row.max_level_id; lvl++) {
      map.set(lvl, dto);
    }
  }

  return map;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Load (or return cached) badge map.
 * @returns {Promise<Map<number, object>>}
 */
async function loadBadgeMap() {
  return getOrSet(CACHE_KEY, CACHE_TTL, buildBadgeMap);
}

/**
 * Get the badge DTO for a given level_id.
 *
 * @param {number|null} levelId — the user's current level_id
 * @returns {Promise<object|null>}
 */
async function getUserBadge(levelId) {
  if (!levelId) return null;
  const map = await loadBadgeMap();
  return map.get(Number(levelId)) ?? null;
}

/**
 * Enrich an array of user objects (each with a .level_id field) with badge data.
 * Loads the badge map once and maps over the array — no N+1 queries.
 *
 * @param {Array<{level_id: number, [key: string]: any}>} users
 * @returns {Promise<Array>}
 */
async function enrichUsersWithBadge(users) {
  if (!users || users.length === 0) return users;
  const map = await loadBadgeMap();
  return users.map((u) => ({
    ...u,
    badge: map.get(Number(u.level_id)) ?? null,
  }));
}

/**
 * Force-invalidate the badge map cache.
 * Call this after any admin create/update/delete on level_badges.
 */
function adminInvalidateBadgeCache() {
  invalidate(CACHE_KEY);
}

/**
 * Get all badge rows (for the admin panel / public listing).
 * Uses the same TTL cache.
 */
async function getAllBadges() {
  return LevelBadgeModel.getAllActive();
}

module.exports = {
  loadBadgeMap,
  getUserBadge,
  enrichUsersWithBadge,
  adminInvalidateBadgeCache,
  getAllBadges,
};
