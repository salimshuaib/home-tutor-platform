/**
 * Debounce and Throttle Utility — Delhi Private Tutors
 * Prevents rapid subsequent function calls for performance optimization.
 */

/**
 * Creates a debounced function that delays invoking `fn` until after wait milliseconds 
 * have elapsed since the last time the debounced function was invoked.
 * @param {Function} fn - The function to debounce
 * @param {number} delay - The number of milliseconds to delay
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  return function (...args) {
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}

/**
 * Creates a throttled function that only invokes `fn` at most once per every limit milliseconds.
 * @param {Function} fn - The function to throttle
 * @param {number} limit - The number of milliseconds to limit
 * @returns {Function}
 */
export function throttle(fn, limit = 300) {
  let inThrottle;
  return function (...args) {
    const context = this;
    if (!inThrottle) {
      fn.apply(context, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
