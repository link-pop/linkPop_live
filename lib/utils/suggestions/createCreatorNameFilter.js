/**
 * Create MongoDB filter for creator name search
 * @param {string} creatorName - The creator name to search for
 * @returns {Object|null} MongoDB filter object or null if no filter needed
 */
export const createCreatorNameFilter = (creatorName) => {
  if (!creatorName || typeof creatorName !== "string" || !creatorName.trim()) {
    return null;
  }

  const trimmedName = creatorName.trim();

  // Create case-insensitive regex for partial matching
  // This will match creators whose name contains the search term
  return {
    $or: [
      { name: { $regex: trimmedName, $options: "i" } },
      { username: { $regex: trimmedName, $options: "i" } },
      { displayName: { $regex: trimmedName, $options: "i" } },
    ],
  };
};

/**
 * Check if a creator name matches the filter (for client-side filtering)
 * @param {string} creatorName - The creator's actual name
 * @param {string} filterName - The name filter to match against
 * @returns {boolean} True if the creator name matches the filter
 */
export const doesCreatorNameMatch = (creatorName, filterName) => {
  if (!filterName || !filterName.trim()) {
    return true; // No filter means all names match
  }

  if (!creatorName) {
    return false; // No creator name means no match
  }

  const normalizedCreatorName = creatorName.toLowerCase();
  const normalizedFilterName = filterName.trim().toLowerCase();

  // Check if creator name contains the filter name (partial match)
  return normalizedCreatorName.includes(normalizedFilterName);
};
