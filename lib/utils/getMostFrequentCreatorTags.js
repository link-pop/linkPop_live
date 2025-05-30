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
 * Get the most frequent age from an array of ages
 * @param {Array} ages - Array of ages (numbers)
 * @returns {number|null} Most frequent age or null if empty
 */
export const getMostFrequentAge = (ages) => {
  if (!ages || !Array.isArray(ages) || ages.length === 0) {
    return null;
  }

  // Count frequency of each age
  const ageCounts = {};
  ages.forEach((age) => {
    if (age && typeof age === "number") {
      ageCounts[age] = (ageCounts[age] || 0) + 1;
    }
  });

  // Find the age with highest frequency
  let mostFrequentAge = null;
  let maxCount = 0;

  Object.entries(ageCounts).forEach(([age, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentAge = parseInt(age, 10);
    }
  });

  return mostFrequentAge;
};

/**
 * Get the most frequent tags from creator tags object
 * @param {Object} creatorTags - Object with raceEthnicity, hairColor, bodyType, gender, age arrays
 * @returns {Object} Object with most frequent tag from each category
 */
export const getMostFrequentCreatorTags = (creatorTags) => {
  if (!creatorTags || typeof creatorTags !== "object") {
    return {
      raceEthnicity: null,
      hairColor: null,
      bodyType: null,
      gender: null,
      age: null,
    };
  }

  return {
    raceEthnicity: getMostFrequentTag(creatorTags.raceEthnicity),
    hairColor: getMostFrequentTag(creatorTags.hairColor),
    bodyType: getMostFrequentTag(creatorTags.bodyType),
    gender: getMostFrequentTag(creatorTags.gender),
    age: getMostFrequentAge(creatorTags.age),
  };
};
