"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import SearchTag from "@/components/ui/shared/SearchTag/SearchTag";

/**
 * Component to display current search tags with remove functionality
 *
 * @param {Object} searchParams - Current search parameters
 * @param {Function} onRemoveTag - Function to call when a tag is removed
 * @param {string} className - Additional CSS classes
 */
export default function SearchCurrentTags({
  searchParams = {},
  onRemoveTag,
  className = "",
}) {
  const { t } = useTranslation();

  // Define which search params to show as tags and their display labels
  const tagMappings = [
    {
      key: "preferCreatorName",
      label: t("creatorName") || "Creator Name",
      getValue: (value) => value,
    },
    {
      key: "preferAge",
      label: t("age") || "Age",
      getValue: (value) => `${value} ±5 years`,
    },
    {
      key: "preferGender",
      label: t("gender") || "Gender",
      getValue: (value) => t(value.replace(/\s+/g, "")) || value,
    },
    {
      key: "preferRaceEthnicity",
      label: t("raceEthnicity") || "Race/Ethnicity",
      getValue: (value) => t(value.replace(/\s+/g, "")) || value,
    },
    {
      key: "preferHairColor",
      label: t("hairColor") || "Hair Color",
      getValue: (value) => t(value.replace(/\s+/g, "")) || value,
    },
    {
      key: "preferBodyType",
      label: t("bodyType") || "Body Type",
      getValue: (value) => t(value.replace(/\s+/g, "")) || value,
    },
    {
      key: "preferCountry",
      label: t("location") || "Location",
      getValue: (value) => value,
    },
  ];

  // Filter out empty search params and create tag objects
  const activeTags = tagMappings
    .filter(({ key }) => {
      const value = searchParams[key];
      return value && value !== "" && value !== "any";
    })
    .map(({ key, label, getValue }) => ({
      key,
      label,
      value: searchParams[key],
      displayText: `${label}: ${getValue(searchParams[key])}`,
    }));

  // Don't render if no active tags
  if (activeTags.length === 0) {
    return null;
  }

  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {activeTags.map(({ key, displayText }) => (
          <SearchTag
            key={key}
            text={displayText}
            onRemove={() => onRemoveTag(key)}
            variant="gray"
            size="sm"
          />
        ))}
      </div>
    </div>
  );
}
