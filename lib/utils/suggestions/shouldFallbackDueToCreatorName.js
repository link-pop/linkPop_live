/**
 * Check if we should fallback due to creator name filtering finding no results
 * @param {Object} mongoUser - The current user object
 * @param {Array} matchingCreators - Array of creators found with current filters
 * @param {boolean} traditionalMatchingAttempted - Whether traditional matching was attempted
 * @returns {boolean} - True if we should fallback due to creator name filter
 */
export const shouldFallbackDueToCreatorName = (
  mongoUser,
  matchingCreators,
  traditionalMatchingAttempted
) => {
  // Only fallback if:
  // 1. Traditional matching was attempted
  // 2. No creators were found
  // 3. User has a creator name preference set
  return (
    traditionalMatchingAttempted &&
    matchingCreators.length === 0 &&
    mongoUser?.preferCreatorName &&
    mongoUser.preferCreatorName.trim().length > 0
  );
};
