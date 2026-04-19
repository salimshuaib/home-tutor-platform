/**
 * Caching Utility — Delhi Private Tutors
 * Uses localStorage to cache API responses and avoid redundant fetches.
 */

const CACHE_PREFIX = 'dpt_cache_';

/**
 * Retrieves valid cached data for a given key.
 * @param {string} key - Cache key
 * @returns {any|null} - The cached value or null if non-existent/expired
 */
export function getCachedData(key) {
  try {
    const itemStr = localStorage.getItem(CACHE_PREFIX + key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = new Date().getTime();

    // Check if the item is expired
    if (now > item.expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return item.value;
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
}

/**
 * Stores data in the cache with a specified TTL (Time To Live).
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttlMs - Time to live in milliseconds (default: 5 minutes)
 */
export function setCachedData(key, value, ttlMs = 300000) {
  try {
    const now = new Date().getTime();
    const item = {
      value: value,
      expiry: now + ttlMs,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  } catch (error) {
    console.warn('Cache write error:', error);
  }
}
