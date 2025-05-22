"use client";

import isNSFWAPILimitReached from "./isNSFWAPILimitReached";

/**
 * Handle API limit errors from NSFW and quality checks
 * @param {Object} error - The error object from the API call
 * @param {Function} toastSet - Function to display toast notifications
 * @param {Function} t - Translation function
 * @param {Object} options - Additional options to pass if bypassing the check
 * @returns {Object} Updated options for bypassing the check if needed
 */
export default function handleNSFWAPILimitError(
  error,
  toastSet,
  t,
  options = {}
) {
  // Check if this is an API limit error
  const isLimitError = isNSFWAPILimitReached(
    error.message || error.error || ""
  );

  // If we hit an API limit, notify the user and bypass the check
  if (isLimitError) {
    console.warn(
      "NSFW/Quality check API limits reached, proceeding with upload anyway"
    );

    toastSet({
      isOpen: true,
      title: t ? t("apiLimitsReached") : "API Limits Reached",
      description: t
        ? t("continuingWithoutChecks")
        : "Content moderation checks are temporarily unavailable. Proceeding with upload without verification.",
      variant: "warning",
    });

    // Return options with skipNSFWCheck set to true
    return {
      ...options,
      skipNSFWCheck: true,
    };
  }

  // If this is not an API limit error, return the original options
  return options;
}
