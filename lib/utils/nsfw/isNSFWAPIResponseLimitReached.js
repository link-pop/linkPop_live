/**
 * Utility function to check if an API response from NSFW check indicates limits have been reached
 * @param {Object} errorData - The error data from the response
 * @returns {boolean} True if API limits are reached, false otherwise
 */
export default function isNSFWAPIResponseLimitReached(errorData) {
  if (!errorData || !errorData.error) return false;

  return (
    errorData.error.includes("API limits reached") ||
    errorData.error.includes("SightEngine API Keys Exhausted") ||
    errorData.error.includes("All API keys failed or reached rate limits")
  );
}
