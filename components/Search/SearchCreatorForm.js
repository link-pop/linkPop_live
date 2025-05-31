"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import Input from "@/components/ui/shared/Input/Input";
import Select from "@/components/ui/shared/Select/Select";
import Switch from "@/components/ui/shared/Switch/Switch";
import LocationSelector from "@/components/ui/shared/LocationSelector/LocationSelector";
import useFormErrors from "@/hooks/useFormErrors";
import { useSearchParamsMemory } from "@/hooks/useSearchParamsMemory";
import {
  HAIR_COLOR_TAGS,
  BODY_TYPE_TAGS,
  RACE_ETHNICITY_TAGS,
  GENDER_TAGS,
  createSelectOptions,
} from "@/lib/constants/creatorTags";

const DEFAULT_SEARCH_PARAMS = {
  preferAge: "",
  preferRaceEthnicity: "",
  preferHairColor: "",
  preferBodyType: "",
  preferGender: "",
  preferCreatorName: "",
  preferCountry: "",
  preferCountryCode: "",
  showPaidOnly: true, // Default to paid creators
  displayAllUsersIfNoMatchFoundForSuggestions: false,
};

export default function SearchCreatorForm({
  mongoUser,
  onSearch,
  isSearching,
  onClearAll,
  externalSearchParams,
}) {
  if (!mongoUser?._id) return null;

  const { t } = useTranslation();
  const isInitialMount = useRef(true);

  // Use the new localStorage memory hook
  const { searchParams, updateSearchParams, clearSearchParams, isLoaded } =
    useSearchParamsMemory(DEFAULT_SEARCH_PARAMS);

  const { errors: formErrors, setMultipleErrors, clearError } = useFormErrors();

  // Sync with external search parameter updates (from tag removal)
  useEffect(() => {
    if (externalSearchParams && isLoaded) {
      // Only update if the external params are different from current params
      const currentParamsString = JSON.stringify(searchParams);
      const externalParamsString = JSON.stringify(externalSearchParams);

      if (currentParamsString !== externalParamsString) {
        updateSearchParams(externalSearchParams);
      }
    }
  }, [externalSearchParams, isLoaded, updateSearchParams]);

  // Auto-search when form changes (debounced) - but not on initial mount
  useEffect(() => {
    // Skip auto-search if localStorage hasn't loaded yet
    if (!isLoaded) {
      return;
    }

    // On initial mount after localStorage loads, check if we have meaningful params and search immediately
    if (isInitialMount.current) {
      isInitialMount.current = false;

      // Check if we have meaningful search parameters from localStorage
      const hasSearchParams = Object.entries(searchParams).some(
        ([key, value]) => {
          // Don't count showPaidOnly as a search parameter since it's just a filter
          if (
            key === "showPaidOnly" ||
            key === "displayAllUsersIfNoMatchFoundForSuggestions"
          ) {
            return false;
          }
          return value !== "" && value !== false;
        }
      );

      if (hasSearchParams) {
        onSearch(searchParams);
      }
      return;
    }

    // For subsequent changes, use debounced search
    const timeoutId = setTimeout(() => {
      // Only trigger search if there's at least one meaningful search parameter
      const hasSearchParams = Object.entries(searchParams).some(
        ([key, value]) => {
          // Don't count showPaidOnly as a search parameter since it's just a filter
          if (
            key === "showPaidOnly" ||
            key === "displayAllUsersIfNoMatchFoundForSuggestions"
          ) {
            return false;
          }
          return value !== "" && value !== false;
        }
      );

      if (hasSearchParams) {
        onSearch(searchParams);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchParams, isLoaded, onSearch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Clear error for this field if it exists
    if (formErrors[name]) {
      clearError(name);
    }

    updateSearchParams({ [name]: value });
  };

  // Handle select changes - this receives the value directly, not an event
  const handleSelectChange = (name) => (value) => {
    // Clear error for this field if it exists
    if (formErrors[name]) {
      clearError(name);
    }

    updateSearchParams({ [name]: value });
  };

  // Handle location changes
  const handleCountryChange = (countryName) => {
    updateSearchParams({ preferCountry: countryName });
  };

  const handleCountryCodeChange = (countryCode) => {
    updateSearchParams({ preferCountryCode: countryCode });
  };

  // Handle state changes (not used but required by LocationSelector)
  const handleStateChange = (stateName) => {
    console.log("State change (not used):", stateName);
  };

  const handleStateCodeChange = (stateCode) => {
    console.log("State code change (not used):", stateCode);
  };

  // Handle switch changes
  const handleSwitchChange = (name) => (value) => {
    updateSearchParams({ [name]: value });
  };

  // Hair color options using constants
  const hairColorOptions = createSelectOptions(
    HAIR_COLOR_TAGS,
    true,
    mongoUser?.profileType === "fan",
    mongoUser?.profileType === "creator"
  ).map((option) => ({
    ...option,
    label: t(option.value.replace(/\s+/g, "")) || option.value,
  }));

  // Body type options using constants
  const bodyTypeOptions = createSelectOptions(
    BODY_TYPE_TAGS,
    true,
    mongoUser?.profileType === "fan",
    mongoUser?.profileType === "creator"
  ).map((option) => ({
    ...option,
    label: t(option.value.replace(/\s+/g, "")) || option.value,
  }));

  // Race/Ethnicity options using constants
  const raceEthnicityOptions = createSelectOptions(
    RACE_ETHNICITY_TAGS,
    true,
    false,
    mongoUser?.profileType === "creator"
  ).map((option) => ({
    ...option,
    label: t(option.value.replace(/\s+/g, "")) || option.value,
  }));

  // Gender options using constants (for fan preferences)
  const genderOptions = createSelectOptions(
    GENDER_TAGS,
    true,
    mongoUser?.profileType === "fan",
    mongoUser?.profileType === "creator"
  ).map((option) => ({
    ...option,
    label: t(option.value.replace(/\s+/g, "")) || option.value,
  }));

  const handleClearFilters = () => {
    clearSearchParams();
    setMultipleErrors({});

    // Notify parent component that Clear All was clicked
    if (onClearAll) {
      onClearAll();
    }
  };

  // Don't render until localStorage has loaded to prevent flash of default values
  if (!isLoaded) {
    return (
      <div className="bg-background border rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-accent/20 rounded mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-accent/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {t("searchFilters") || "Search Filters"}
        </h2>
        <div
          onClick={handleClearFilters}
          className="text-sm text-foreground/60 hover:text-foreground cursor-pointer"
        >
          {t("clearAll") || "Clear All"}
        </div>
      </div>

      <div className="fc g20 wf">
        {/* CREATOR NAME SEARCH */}
        <div className="fc g5">
          <Input
            type="text"
            name="preferCreatorName"
            value={searchParams.preferCreatorName}
            onChange={handleInputChange}
            className="gray br5"
            label={t("creatorName") || "Creator Name"}
            error={formErrors.preferCreatorName}
            helperText={
              t("creatorNameFilterHelp") ||
              "Search creators by name or username (partial matches supported)"
            }
            placeholder={t("enterCreatorName") || "Enter creator name..."}
          />
        </div>

        {/* AGE FILTER */}
        <div className="fc g5">
          <Input
            type="number"
            name="preferAge"
            value={searchParams.preferAge}
            onChange={handleInputChange}
            className="gray br5"
            label={t("age") || "Age"}
            min={18}
            max={120}
            error={formErrors.preferAge}
            helperText={
              t("plusMinus5yearsResults") || "+/- 5 years results will be shown"
            }
          />
        </div>

        {/* GENDER FILTER */}
        <div className="fc g5">
          <Select
            name="preferGender"
            value={searchParams.preferGender}
            onValueChange={handleSelectChange("preferGender")}
            className="gray br5"
            label={t("gender") || "Gender"}
            options={genderOptions}
            error={formErrors.preferGender}
            placeholder={t("selectOption")}
            version="new"
          />
        </div>

        {/* RACE / ETHNICITY */}
        {mongoUser?.isDev && (
          <div className="fc g5">
            <Select
              name="preferRaceEthnicity"
              value={searchParams.preferRaceEthnicity}
              onValueChange={handleSelectChange("preferRaceEthnicity")}
              className="gray br5"
              label={t("raceEthnicity") || "Race / Ethnicity"}
              options={raceEthnicityOptions}
              error={formErrors.preferRaceEthnicity}
              placeholder={t("selectOption")}
              version="new"
            />
          </div>
        )}

        {/* HAIR COLOR */}
        <div className="fc g5">
          <Select
            name="preferHairColor"
            value={searchParams.preferHairColor}
            onValueChange={handleSelectChange("preferHairColor")}
            className="gray br5"
            label={t("hairColor") || "Hair Color"}
            options={hairColorOptions}
            error={formErrors.preferHairColor}
            placeholder={t("selectOption")}
            version="new"
          />
        </div>

        {/* BODY TYPE / BUILD */}
        <div className="fc g5">
          <Select
            name="preferBodyType"
            value={searchParams.preferBodyType}
            onValueChange={handleSelectChange("preferBodyType")}
            className="gray br5"
            label={t("bodyType") || "Body Type / Build"}
            options={bodyTypeOptions}
            error={formErrors.preferBodyType}
            placeholder={t("selectOption")}
            version="new"
          />
        </div>

        {/* LOCATION FILTER */}
        <div className="fc g5">
          <LocationSelector
            key={`${searchParams.preferCountry}-${searchParams.preferCountryCode}`}
            name="preferCountry"
            onCountryChange={handleCountryChange}
            onCountryCodeChange={handleCountryCodeChange}
            onStateChange={handleStateChange}
            onStateCodeChange={handleStateCodeChange}
            className="fc g15"
            defaultValue={{
              country: searchParams.preferCountry,
              country_code: searchParams.preferCountryCode,
            }}
            hideState={true}
            label={t("location") || "Location"}
            required={false}
          />
        </div>

        {/* PRICE FILTER */}
        <div className="fc g5">
          <Switch
            name="showPaidOnly"
            label={t("showPaidCreatorsOnly") || "Show paid creators only"}
            isChecked={searchParams.showPaidOnly}
            onCheckedChange={handleSwitchChange("showPaidOnly")}
            className="p-3 bg-accent/5 rounded-md"
          />
        </div>

        {/* DISPLAY ALL USERS IF NO MATCH FOUND */}
        <div className="fc g5">
          <Switch
            name="displayAllUsersIfNoMatchFoundForSuggestions"
            label={
              t("displayAllUsersIfNoMatchFoundForSuggestions") ||
              "Show all creators if no matches found for your search"
            }
            isChecked={searchParams.displayAllUsersIfNoMatchFoundForSuggestions}
            onCheckedChange={handleSwitchChange(
              "displayAllUsersIfNoMatchFoundForSuggestions"
            )}
            className="f fwn p-3 bg-accent/5 rounded-md"
          />
        </div>
      </div>
    </div>
  );
}
