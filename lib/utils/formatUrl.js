/**
 * Formats a URL by:
 * 1. Adding https:// prefix if missing
 * 2. Removing any existing protocol (http://, https://)
 * 3. Ensuring proper formatting
 *
 * @param {string} url - The URL to format
 * @param {boolean} addWww - Whether to add www. if missing (default: true)
 * @returns {string} - The formatted URL
 */
export function formatUrl(url) {
  if (!url) return "";

  // Check if it's localhost in dev mode
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  if (isDevMode && url.includes("localhost")) {
    // For localhost, preserve existing protocol or default to http://
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return "http://" + url;
  }

  // Remove existing protocol if present
  const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/i, "");

  // Add https:// prefix
  return "https://" + cleanUrl;
}

/**
 * Validates if a string is a valid URL
 *
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
export function validateUrl(url) {
  if (!url) return true; // Empty is valid

  // Check if it's localhost in dev mode
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  if (isDevMode && url.includes("localhost")) {
    return true;
  }

  // Add https:// temporarily for validation purpose
  const testUrl = url.startsWith("http") ? url : `https://${url}`;

  try {
    new URL(testUrl);

    // Ensure there's a domain extension (at least one dot followed by 2+ characters)
    const domainPattern = /\.[a-z]{2,}($|\/)/i;
    return domainPattern.test(testUrl);
  } catch (e) {
    return false;
  }
}
