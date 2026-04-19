/**
 * Sanitizes a string to prevent XSS when rendering into DOM.
 * @param {string} str - Raw string
 * @returns {string} Sanitized string
 */
export function safeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
