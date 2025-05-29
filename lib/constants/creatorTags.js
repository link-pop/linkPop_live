/**
 * Creator Tags Constants - Single Source of Truth
 * These values are used across the entire application for consistency
 * Extracted from generateImageTags.js AI analysis categories
 */

// Race/Ethnicity options
export const RACE_ETHNICITY_TAGS = [
  "white",
  "black",
  "asian",
  "latina",
  "arab",
  "indian",
  "mixed race",
  "middle eastern",
  "native american",
];

// Hair color options
export const HAIR_COLOR_TAGS = [
  "blonde",
  "brunette",
  "black hair",
  "redhead",
  "brown hair",
  "gray hair",
  "white hair",
  "pink hair",
  "blue hair",
  "purple hair",
  "green hair",
  "rainbow hair",
];

// Body type options
export const BODY_TYPE_TAGS = [
  "skinny",
  "slim",
  "athletic",
  "fit",
  "average",
  "curvy",
  "thick",
  "chubby",
  "bbw",
  "muscular",
  "petite",
  "tall",
];

// Helper function to create options for UI components
export const createSelectOptions = (
  tags,
  includeOther = false,
  includeAny = false,
  isCreator = false
) => {
  const options = tags.map((tag) => ({
    value: tag,
    label: tag,
  }));

  if (includeOther) {
    options.push({
      value: "other",
      label: isCreator ? "other" : "any",
    });
  }

  if (includeAny) {
    options.push({
      value: "any",
      label: "any",
    });
  }

  return options;
};

// Pre-built option arrays for common use cases
export const RACE_ETHNICITY_OPTIONS = createSelectOptions(
  RACE_ETHNICITY_TAGS,
  true
);
export const HAIR_COLOR_OPTIONS = createSelectOptions(HAIR_COLOR_TAGS, true);
export const BODY_TYPE_OPTIONS = createSelectOptions(BODY_TYPE_TAGS, true);

// For fans (includes "any" option)
export const HAIR_COLOR_OPTIONS_FAN = createSelectOptions(
  HAIR_COLOR_TAGS,
  true,
  true
);
export const BODY_TYPE_OPTIONS_FAN = createSelectOptions(
  BODY_TYPE_TAGS,
  true,
  true
);
