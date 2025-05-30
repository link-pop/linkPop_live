/**
 * Check if a creator's location matches the user's preferred location
 * @param {string} userPreferredCountry - User's preferred country name
 * @param {string} userPreferredCountryCode - User's preferred country code
 * @param {Object} creator - Creator object with location fields
 * @returns {boolean} - True if location matches
 */
export const doesLocationMatch = (
  userPreferredCountry,
  userPreferredCountryCode,
  creator
) => {
  // If no location preference is set, consider it a match (no filtering)
  if (!userPreferredCountry && !userPreferredCountryCode) {
    return true;
  }

  // If creator has no location data, consider it a non-match
  if (!creator.country && !creator.countryCode) {
    return false;
  }

  // Primary matching: use country codes if both are available (more reliable)
  if (userPreferredCountryCode && creator.countryCode) {
    return (
      userPreferredCountryCode.toLowerCase() ===
      creator.countryCode.toLowerCase()
    );
  }

  // Fallback matching: use country names with flexible matching
  if (userPreferredCountry && creator.country) {
    const userCountry = userPreferredCountry.toLowerCase().trim();
    const creatorCountry = creator.country.toLowerCase().trim();

    // Exact match
    if (userCountry === creatorCountry) {
      return true;
    }

    // Partial match (in case of slight variations in country names)
    if (
      userCountry.includes(creatorCountry) ||
      creatorCountry.includes(userCountry)
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Create location filter for database queries
 * @param {string} preferredCountry - User's preferred country name
 * @param {string} preferredCountryCode - User's preferred country code
 * @returns {Object|null} - MongoDB filter object or null if no location preference
 */
export const createLocationFilter = (
  preferredCountry,
  preferredCountryCode
) => {
  // If no location preference is set, return null (no filtering)
  if (!preferredCountry && !preferredCountryCode) {
    return null;
  }

  const locationFilter = { $or: [] };

  // Add country code filter if available (more reliable)
  if (preferredCountryCode) {
    locationFilter.$or.push({
      countryCode: { $regex: new RegExp(`^${preferredCountryCode}$`, "i") },
    });
  }

  // Add country name filter if available
  if (preferredCountry) {
    locationFilter.$or.push({
      country: { $regex: new RegExp(preferredCountry, "i") },
    });
  }

  // If no valid filters were added, return null
  if (locationFilter.$or.length === 0) {
    return null;
  }

  return locationFilter;
};
