/**
 * Utility function to check if NSFW API limits are reached
 * Detects API limit errors based on error messages
 * @param {string} errorMessage - The error message to check
 * @returns {boolean} True if API limits are reached, false otherwise
 */
export default function isNSFWAPILimitReached(errorMessage) {
  if (!errorMessage) return false;

  return (
    errorMessage.includes("API limits reached") ||
    errorMessage.includes("SightEngine API Keys Exhausted") ||
    errorMessage.includes("All API keys failed or reached rate limits")
  );
}
