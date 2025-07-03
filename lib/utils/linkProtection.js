import { PROTECTED_LINK_REDIRECT_ROUTE } from "./constants";

/**
 * Gets the correct social links collection name based on site configuration
 * @returns {string} The collection name to use
 */
export function getSocialLinksCollectionName() {
  // Import dynamically to avoid server-side issues
  const { SITE1, SITE2 } = require("@/config/env");

  return SITE1 ? "s1sociallinks" : SITE2 ? "s2sociallinks" : "sociallinks";
}

/**
 * Generates a secure protection key for a social link
 * @param {string} linkId - The ID of the social link
 * @param {string} platform - The platform name
 * @returns {string} A secure protection key
 */
export function generateProtectionKey(linkId, platform) {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  const combined = `${linkId}_${platform}_${timestamp}_${random}`;

  // Create a simple hash-like string
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36) + random;
}

/**
 * Checks if a platform should be protected from bots
 * @param {string} platform - The platform name
 * @returns {boolean} True if the platform should be protected
 */
export function shouldProtectPlatform(platform) {
  // Protect ALL links from bots/crawlers to prevent site bans
  return true;
}

/**
 * Generates a protected URL for a social link
 * @param {string} linkId - The ID of the social link
 * @param {string} protectionKey - The protection key
 * @returns {string} The protected URL
 */
export function generateProtectedUrl(linkId, protectionKey) {
  const params = new URLSearchParams({
    linkId,
    key: protectionKey,
  });

  return `${PROTECTED_LINK_REDIRECT_ROUTE}?${params.toString()}`;
}

/**
 * Generates a fake/placeholder URL for display purposes
 * @param {string} platform - The platform name
 * @param {string} label - The link label
 * @returns {string} A fake URL for display
 */
export function generateFakeUrl(platform, label) {
  const safeDomain = "linkpop.com";
  const safePath =
    platform === "other"
      ? `/${label?.toLowerCase().replace(/\s+/g, "-") || "link"}`
      : `/${platform}`;

  return `https://${safeDomain}${safePath}`;
}

/**
 * Determines the display URL for a social link
 * @param {Object} link - The social link object
 * @returns {string} The URL to display/use
 */
export function getLinkDisplayUrl(link) {
  if (!link.isProtected) {
    // For non-protected links, return the real URL
    if (link.platform === "other" && link.websiteUrl) {
      return link.websiteUrl;
    }

    // For social media platforms, construct the URL
    const { platformUrls } = require("@/lib/data/platformData");
    const baseUrl = platformUrls[link.platform] || "";
    if (!baseUrl || !link.username) return "#";

    const cleanUsername = link.username.startsWith("@")
      ? link.username.substring(1)
      : link.username;
    return baseUrl + cleanUsername;
  }

  // For protected links, return the protected URL
  return generateProtectedUrl(link._id, link.protectionKey);
}
