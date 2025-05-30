/**
 * Check if an age falls within a preferred age range
 * @param {number} targetAge - The age to check
 * @param {number} preferredAge - The preferred age (center of range)
 * @param {number} rangeSize - The range size (default: 5 years on each side)
 * @returns {boolean} - True if age falls within range
 */
export const isAgeInRange = (targetAge, preferredAge, rangeSize = 5) => {
  if (!targetAge || !preferredAge) {
    return false;
  }

  const minAge = Math.max(18, preferredAge - rangeSize);
  const maxAge = preferredAge + rangeSize;

  return targetAge >= minAge && targetAge <= maxAge;
};

/**
 * Get age range string for display purposes
 * @param {number} preferredAge - The preferred age (center of range)
 * @param {number} rangeSize - The range size (default: 5 years on each side)
 * @returns {string} - Age range string like "23-33"
 */
export const getAgeRangeString = (preferredAge, rangeSize = 5) => {
  if (!preferredAge) {
    return "";
  }

  const minAge = Math.max(18, preferredAge - rangeSize);
  const maxAge = preferredAge + rangeSize;

  return `${minAge}-${maxAge}`;
};

/**
 * Check if a creator's most frequent age matches fan's preference
 * @param {number} creatorAge - Creator's most frequent age
 * @param {number} fanPreferredAge - Fan's preferred age
 * @param {number} rangeSize - The range size (default: 5 years on each side)
 * @returns {boolean} - True if ages match within range
 */
export const doesAgeMatch = (creatorAge, fanPreferredAge, rangeSize = 5) => {
  return isAgeInRange(creatorAge, fanPreferredAge, rangeSize);
};
