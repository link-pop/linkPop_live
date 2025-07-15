// lib/utils/escapeRegExp.js

/**
 * Escapes special characters in a string for use in a regular expression.
 * @param {string} str The string to escape.
 * @returns {string} The escaped string.
 */
export function escapeRegExp(str) {
  // $& means the whole matched string
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
