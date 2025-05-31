"use client";

import { CheckCircle } from "lucide-react";
import SuggestionAttribute from "@/components/Suggestions/SuggestionAttribute";
import HighlightedText from "@/components/ui/shared/HighlightedText/HighlightedText";
import { useTranslation } from "@/components/Context/TranslationContext";
import { getMostFrequentCreatorTags } from "@/lib/utils/getMostFrequentCreatorTags";
import { hasUserPreferences } from "@/lib/utils/hasUserPreferences";
import { doesAgeMatch } from "@/lib/utils/ageRangeMatching";

export default function SuggestionUserDetails({
  user,
  currentUser,
  searchParams = {},
}) {
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

  // Get the name filter for highlighting from search params or user preferences
  const nameFilter =
    searchParams.preferCreatorName || currentUser?.preferCreatorName || "";

  // Helper function to check if a tag matches search parameters and should be highlighted
  const shouldHighlightTag = (tagType, tagValue) => {
    if (!tagValue) return false;

    // First check if we have search parameters to match against
    if (searchParams && Object.keys(searchParams).length > 0) {
      switch (tagType) {
        case "hairColor":
          return (
            searchParams.preferHairColor &&
            !["any", "other"].includes(
              searchParams.preferHairColor.toLowerCase()
            ) &&
            searchParams.preferHairColor === tagValue
          );
        case "bodyType":
          return (
            searchParams.preferBodyType &&
            !["any", "other"].includes(
              searchParams.preferBodyType.toLowerCase()
            ) &&
            searchParams.preferBodyType === tagValue
          );
        case "gender":
          return (
            searchParams.preferGender &&
            !["any", "other"].includes(
              searchParams.preferGender.toLowerCase()
            ) &&
            searchParams.preferGender === tagValue
          );
        case "age":
          return (
            searchParams.preferAge &&
            doesAgeMatch(tagValue, searchParams.preferAge)
          );
        case "raceEthnicity":
          return (
            searchParams.preferRaceEthnicity &&
            !["any", "other"].includes(
              searchParams.preferRaceEthnicity.toLowerCase()
            ) &&
            searchParams.preferRaceEthnicity === tagValue
          );
        case "countryCode":
          return (
            searchParams.preferCountryCode &&
            searchParams.preferCountryCode.toUpperCase() ===
              tagValue.toUpperCase()
          );
        default:
          return false;
      }
    }

    // Fallback to user preferences if no search params
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
          return (
            currentUser?.preferRaceEthnicity &&
            !["any", "other"].includes(
              currentUser.preferRaceEthnicity.toLowerCase()
            ) &&
            currentUser.preferRaceEthnicity === tagValue
          );
        case "countryCode":
          return (
            currentUser?.preferCountryCode &&
            currentUser.preferCountryCode.toUpperCase() ===
              tagValue.toUpperCase()
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
      case "countryCode":
        // CountryCode is not tracked in smart matching, only in traditional matching
        return false;
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
        {/* Country Code - always show from profile attributes since it's not in uploaded tags */}
        {user.countryCode && (
          <SuggestionAttribute
            value={user.countryCode.toUpperCase()}
            className={
              shouldHighlightTag("countryCode", user.countryCode)
                ? "border-[var(--color-brand)] border-2"
                : ""
            }
          />
        )}
      </div>
    </div>
  );
}
