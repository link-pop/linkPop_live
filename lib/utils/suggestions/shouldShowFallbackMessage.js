import { hasUserPreferences } from "../hasUserPreferences";
import { MIN_VISITED_CREATOR_TAGS_FOR_SMART_MATCHING } from "../constants";

/**
 * Determine whether to show the "No match found - showing all creators" fallback message
 * Only show this message when the user has either:
 * 1. Set explicit preferences (traditional matching was attempted)
 * 2. Has sufficient visited creator tags for smart matching (smart matching was attempted)
 *
 * @param {Object} currentUser - The current user object
 * @param {string} suggestionsApproach - The approach used to generate suggestions
 * @param {boolean} nameFilterFallback - Whether fallback occurred due to creator name filtering
 * @returns {boolean} - Whether to show the fallback message
 */
export const shouldShowFallbackMessage = (
  currentUser,
  suggestionsApproach,
  nameFilterFallback = false
) => {
  // Show fallback message if:
  // 1. Creator name filtering caused a fallback (no exact name match found)
  // 2. OR user has preferences but we're showing fallback results (no exact match for preferences)

  if (nameFilterFallback) {
    return true;
  }

  // Only show fallback message for "fallback" approach
  if (suggestionsApproach !== "fallback") {
    return false;
  }

  // Check if user has explicit preferences set
  const userHasPreferences = hasUserPreferences(currentUser);

  // Check if user has sufficient visited creator tags for smart matching
  const hasVisitedCreatorsTags =
    currentUser?.lastVisitedCreatorsTags &&
    ((currentUser.lastVisitedCreatorsTags.raceEthnicity &&
      currentUser.lastVisitedCreatorsTags.raceEthnicity.length >=
        MIN_VISITED_CREATOR_TAGS_FOR_SMART_MATCHING) ||
      (currentUser.lastVisitedCreatorsTags.hairColor &&
        currentUser.lastVisitedCreatorsTags.hairColor.length >=
          MIN_VISITED_CREATOR_TAGS_FOR_SMART_MATCHING) ||
      (currentUser.lastVisitedCreatorsTags.bodyType &&
        currentUser.lastVisitedCreatorsTags.bodyType.length >=
          MIN_VISITED_CREATOR_TAGS_FOR_SMART_MATCHING) ||
      (currentUser.lastVisitedCreatorsTags.gender &&
        currentUser.lastVisitedCreatorsTags.gender.length >=
          MIN_VISITED_CREATOR_TAGS_FOR_SMART_MATCHING) ||
      (currentUser.lastVisitedCreatorsTags.age &&
        currentUser.lastVisitedCreatorsTags.age.length >=
          MIN_VISITED_CREATOR_TAGS_FOR_SMART_MATCHING));

  // Only show fallback message if user has preferences OR sufficient tags for smart matching
  // This means either traditional matching or smart matching was attempted and failed
  return userHasPreferences || hasVisitedCreatorsTags;
};
