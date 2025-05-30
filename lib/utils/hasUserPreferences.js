/**
 * Check if user has set any preferences for traditional matching
 * @param {Object} mongoUser - The user object from MongoDB
 * @returns {boolean} - True if user has any preferences set
 */
export const hasUserPreferences = (mongoUser) => {
  const hasPreferAge = !!mongoUser?.preferAge;
  const hasHairColor =
    mongoUser?.preferHairColor &&
    !["any", "other"].includes(mongoUser.preferHairColor.toLowerCase());
  const hasBodyType =
    mongoUser?.preferBodyType &&
    !["any", "other"].includes(mongoUser.preferBodyType.toLowerCase());
  const hasGender =
    mongoUser?.preferGender &&
    !["any", "other"].includes(mongoUser.preferGender.toLowerCase());
  const hasRaceEthnicity =
    mongoUser?.preferRaceEthnicity &&
    !["any", "other"].includes(mongoUser.preferRaceEthnicity.toLowerCase());
  const hasCreatorName =
    mongoUser?.preferCreatorName &&
    mongoUser.preferCreatorName.trim().length > 0;
  const hasCountry =
    mongoUser?.preferCountry && mongoUser.preferCountry.trim().length > 0;
  const hasCountryCode =
    mongoUser?.preferCountryCode &&
    mongoUser.preferCountryCode.trim().length > 0;

  return (
    hasPreferAge ||
    hasHairColor ||
    hasBodyType ||
    hasGender ||
    hasRaceEthnicity ||
    hasCreatorName ||
    hasCountry ||
    hasCountryCode
  );
};
