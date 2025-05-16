"use client";

import isNSFWAPILimitReached from "./isNSFWAPILimitReached";

/**
 * Utility function to handle NSFW API limit errors
 * Displays a warning message and returns updated options with NSFW check bypassed
 *
 * @param {Object} error - The error object from NSFW check
 * @param {Function} toastFunction - Toast function to display messages (if available)
 * @param {Function} t - Translation function (if available)
 * @param {Object} uploadOptions - Current upload options
 * @returns {Object} Updated upload options with skipNSFWCheck set to true if API limits are reached
 */
export default function handleNSFWAPILimitError(
  error,
  toastFunction = null,
  t = null,
  uploadOptions = {}
) {
  // Default translator function if not provided
  const translate = t || ((key) => key);

  // Check if this is an API limit error
  const isApiLimitReached = error && isNSFWAPILimitReached(error.message);

  if (isApiLimitReached) {
    console.warn(
      "NSFW check API limits reached, proceeding with upload anyway"
    );

    // Display warning toast if toast function is available
    if (toastFunction) {
      toastFunction({
        isOpen: true,
        title:
          translate("nsfwCheckLimitsReached") || "NSFW check limits reached",
        description:
          translate("proceedingWithUploadAnyway") ||
          "Proceeding with upload anyway",
        variant: "warning",
      });
    }

    // Create a new options object with skipNSFWCheck set to true
    return {
      ...uploadOptions,
      skipNSFWCheck: true,
    };
  }

  // If not an API limit error, return the original options
  return uploadOptions;
}
