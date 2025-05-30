/**
 * Check if user has set any preferences for traditional matching
 * @param {Object} mongoUser - The user object from MongoDB
 * @returns {boolean} - True if user has any preferences set
 */
export const hasUserPreferences = (mongoUser) => {
  const hasPreferAge = !!mongoUser?.preferAge;
  const hasHairColor =
    mongoUser?.hairColor &&
    !["any", "other"].includes(mongoUser.hairColor.toLowerCase());
  const hasBodyType =
    mongoUser?.bodyType &&
    !["any", "other"].includes(mongoUser.bodyType.toLowerCase());
  const hasGender =
    mongoUser?.preferGender &&
    !["any", "other"].includes(mongoUser.preferGender.toLowerCase());
  const hasRaceEthnicity =
    mongoUser?.raceEthnicity &&
    !["any", "other"].includes(mongoUser.raceEthnicity.toLowerCase());

  return (
    hasPreferAge || hasHairColor || hasBodyType || hasGender || hasRaceEthnicity
  );
};
