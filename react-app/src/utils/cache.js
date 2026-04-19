/**
 * Retrieves cached data from localStorage if not expired.
 * @param {string} key - Cache key
 * @returns {any|null} Cached data or null if expired/missing
 */
export function getCachedData(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * Stores data in localStorage with a TTL.
 * @param {string} key - Cache key
 * @param {any} value - Data to cache
 * @param {number} ttlMs - Time-to-live in milliseconds (default: 5 minutes)
 */
export function setCachedData(key, value, ttlMs = 300000) {
  try {
    const item = {
      data: value,
      expiry: Date.now() + ttlMs
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (e) {
    console.warn('Cache write failed:', e);
  }
}
