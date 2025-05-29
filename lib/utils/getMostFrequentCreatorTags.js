/**
 * Get the most frequent tag from an array of tags
 * @param {Array} tags - Array of tags
 * @returns {string|null} Most frequent tag or null if empty
 */
export const getMostFrequentTag = (tags) => {
  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return null;
  }

  // Count frequency of each tag
  const tagCounts = {};
  tags.forEach((tag) => {
    if (tag && typeof tag === "string") {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  });

  // Find the tag with highest frequency
  let mostFrequentTag = null;
  let maxCount = 0;

  Object.entries(tagCounts).forEach(([tag, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentTag = tag;
    }
  });

  return mostFrequentTag;
};

/**
 * Get the most frequent tags from creator tags object
 * @param {Object} creatorTags - Object with raceEthnicity, hairColor, bodyType arrays
 * @returns {Object} Object with most frequent tag from each category
 */
export const getMostFrequentCreatorTags = (creatorTags) => {
  if (!creatorTags || typeof creatorTags !== "object") {
    return {
      raceEthnicity: null,
      hairColor: null,
      bodyType: null,
    };
  }

  return {
    raceEthnicity: getMostFrequentTag(creatorTags.raceEthnicity),
    hairColor: getMostFrequentTag(creatorTags.hairColor),
    bodyType: getMostFrequentTag(creatorTags.bodyType),
  };
};
