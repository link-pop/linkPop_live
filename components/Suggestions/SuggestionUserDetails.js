"use client";

import { CheckCircle } from "lucide-react";
import SuggestionAttribute from "@/components/Suggestions/SuggestionAttribute";
import HighlightedText from "@/components/ui/shared/HighlightedText/HighlightedText";
import { useTranslation } from "@/components/Context/TranslationContext";
import { getMostFrequentCreatorTags } from "@/lib/utils/getMostFrequentCreatorTags";
import { hasUserPreferences } from "@/lib/utils/hasUserPreferences";
import { doesAgeMatch } from "@/lib/utils/ageRangeMatching";

export default function SuggestionUserDetails({ user, currentUser }) {
  const { t } = useTranslation();

  if (!user) return null;

  // Get the most frequent tags from lastUploadedCreatorTags if available
  const mostFrequentTags = user.lastUploadedCreatorTags
    ? getMostFrequentCreatorTags(user.lastUploadedCreatorTags)
    : null;

  // Check if user has preferences set
  const userHasPreferences = hasUserPreferences(currentUser);

  // Get current user's most frequent visited creator tags for smart matching highlighting
  const userMostFrequentTags = currentUser?.lastVisitedCreatorsTags
    ? getMostFrequentCreatorTags(currentUser.lastVisitedCreatorsTags)
    : null;

  // Get the name filter for highlighting
  const nameFilter = currentUser?.preferCreatorName || "";

  // Helper function to check if a tag matches user's preferences and should be highlighted
  const shouldHighlightTag = (tagType, tagValue) => {
    if (!tagValue) return false;

    // If user has preferences set, use traditional matching (user preferences)
    if (userHasPreferences) {
      switch (tagType) {
        case "hairColor":
          return (
            currentUser?.preferHairColor &&
            !["any", "other"].includes(
              currentUser.preferHairColor.toLowerCase()
            ) &&
            currentUser.preferHairColor === tagValue
          );
        case "bodyType":
          return (
            currentUser?.preferBodyType &&
            !["any", "other"].includes(
              currentUser.preferBodyType.toLowerCase()
            ) &&
            currentUser.preferBodyType === tagValue
          );
        case "gender":
          return (
            currentUser?.preferGender &&
            !["any", "other"].includes(
              currentUser.preferGender.toLowerCase()
            ) &&
            currentUser.preferGender === tagValue
          );
        case "age":
          return (
            currentUser?.preferAge &&
            doesAgeMatch(tagValue, currentUser.preferAge)
          );
        case "raceEthnicity":
          // Race/ethnicity is not typically used in user preferences, but include for completeness
          return (
            currentUser?.preferRaceEthnicity &&
            !["any", "other"].includes(
              currentUser.preferRaceEthnicity.toLowerCase()
            ) &&
            currentUser.preferRaceEthnicity === tagValue
          );
        default:
          return false;
      }
    }

    // If user has no preferences, use smart matching (lastVisitedCreatorsTags)
    if (!userMostFrequentTags) return false;

    switch (tagType) {
      case "raceEthnicity":
        return userMostFrequentTags.raceEthnicity === tagValue;
      case "hairColor":
        return userMostFrequentTags.hairColor === tagValue;
      case "bodyType":
        return userMostFrequentTags.bodyType === tagValue;
      case "gender":
        return userMostFrequentTags.gender === tagValue;
      case "age":
        return (
          userMostFrequentTags.age &&
          doesAgeMatch(tagValue, userMostFrequentTags.age)
        );
      default:
        return false;
    }
  };

  return (
    <div className="text-white">
      <div className="flex items-center gap-1">
        <HighlightedText
          text={user.name}
          highlight={nameFilter}
          className="text-base font-medium"
          highlightClassName="brand"
        />
        {user.isVerified && <CheckCircle size={16} className="text-white" />}
      </div>
      <span className="text-xs text-white/80">
        @
        <HighlightedText
          text={user.username}
          highlight={nameFilter}
          highlightClassName="brand"
        />
      </span>
      <div className="flex flex-wrap gap-1 mt-1">
        {user.age && (
          <SuggestionAttribute
            value={user.age}
            className={
              shouldHighlightTag("age", user.age)
                ? "border-[var(--color-brand)] border-2"
                : ""
            }
          />
        )}
        {/* Show most frequent tags from lastUploadedCreatorTags if available, otherwise fallback to profile attributes */}
        {mostFrequentTags ? (
          <>
            {/* Only show raceEthnicity if current user is dev */}
            {currentUser?.isDev && mostFrequentTags.raceEthnicity && (
              <SuggestionAttribute
                value={t(mostFrequentTags.raceEthnicity)}
                className={
                  shouldHighlightTag(
                    "raceEthnicity",
                    mostFrequentTags.raceEthnicity
                  )
                    ? "border-[var(--color-brand)] border-2"
                    : ""
                }
              />
            )}
            {mostFrequentTags.hairColor && (
              <SuggestionAttribute
                value={t(mostFrequentTags.hairColor)}
                className={
                  shouldHighlightTag("hairColor", mostFrequentTags.hairColor)
                    ? "border-[var(--color-brand)] border-2"
                    : ""
                }
              />
            )}
            {mostFrequentTags.bodyType && (
              <SuggestionAttribute
                value={t(mostFrequentTags.bodyType)}
                className={
                  shouldHighlightTag("bodyType", mostFrequentTags.bodyType)
                    ? "border-[var(--color-brand)] border-2"
                    : ""
                }
              />
            )}
            {mostFrequentTags.gender && (
              <SuggestionAttribute
                value={t(mostFrequentTags.gender)}
                className={
                  shouldHighlightTag("gender", mostFrequentTags.gender)
                    ? "border-[var(--color-brand)] border-2"
                    : ""
                }
              />
            )}
          </>
        ) : (
          <>
            {/* Only show raceEthnicity if current user is dev */}
            {currentUser?.isDev && user.raceEthnicity && (
              <SuggestionAttribute
                value={t(user.raceEthnicity)}
                className={
                  shouldHighlightTag("raceEthnicity", user.raceEthnicity)
                    ? "border-[var(--color-brand)] border-2"
                    : ""
                }
              />
            )}
            {user.hairColor && (
              <SuggestionAttribute
                value={t(user.hairColor)}
                className={
                  shouldHighlightTag("hairColor", user.hairColor)
                    ? "border-[var(--color-brand)] border-2"
                    : ""
                }
              />
            )}
            {user.bodyType && (
              <SuggestionAttribute
                value={t(user.bodyType)}
                className={
                  shouldHighlightTag("bodyType", user.bodyType)
                    ? "border-[var(--color-brand)] border-2"
                    : ""
                }
              />
            )}
            {user.gender && (
              <SuggestionAttribute
                value={t(user.gender)}
                className={
                  shouldHighlightTag("gender", user.gender)
                    ? "border-[var(--color-brand)] border-2"
                    : ""
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
