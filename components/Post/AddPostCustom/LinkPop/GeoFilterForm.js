"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/shared/Button/Button2";
import LocationSelector from "@/components/ui/shared/LocationSelector/LocationSelector";
import { getOne, add, update } from "@/lib/actions/crud";
import { syncGeoFilterData } from "@/lib/actions/syncGeoFilterData";
import { useContext } from "@/components/Context/Context";
import { XCircle, Loader2 } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";
import FormActiveCheckbox from "./FormActiveCheckbox";
import { useFeatureAccess } from "@/lib/utils/useFeatureAccess";
import UpgradeMessageCard from "@/components/ui/shared/UpgradeMessageCard";

export default function GeoFilterForm({
  entityId,
  entityType,
  refreshPreview,
  onComplete = () => {},
}) {
  const [mode, setMode] = useState("block");
  const [locations, setLocations] = useState([]);
  const [tempLocation, setTempLocation] = useState({
    country: "",
    state: "",
    country_code: "",
    state_code: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [geoFilterId, setGeoFilterId] = useState(null);
  const [active, setActive] = useState(true);
  // Use the new hook to check access
  const accessStatus = useFeatureAccess({
    entityId,
    entityType:
      entityType === "landingpage"
        ? "landingpages"
        : entityType === "directlink"
        ? "directlinks"
        : entityType,
    requiredPlan: "creator",
  });
  const { toastSet, langId } = useContext();
  const { t } = useTranslation();

  // Load existing geo filter data
  useEffect(() => {
    const loadGeoFilter = async () => {
      // Don't load data if we don't have entity ID or access is denied
      if (
        !entityId ||
        (accessStatus.isChecking === false && !accessStatus.hasAccess)
      ) {
        setIsLoading(false);
        return;
      }

      try {
        console.log(
          `GeoFilterForm - Loading filter for ${entityType} with ID ${entityId}`
        );

        const existingFilter = await getOne({
          col: "geofilters",
          data: { entityId, entityType },
        });

        console.log(
          "GeoFilterForm - Existing filter:",
          existingFilter ? "Found" : "Not found"
        );

        if (existingFilter) {
          setMode(existingFilter.mode || "block");
          setLocations(existingFilter.locations || []);
          setGeoFilterId(existingFilter._id);
          setActive(
            existingFilter.active !== undefined ? existingFilter.active : true
          );
        }
      } catch (error) {
        console.error("Error loading geo filter:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGeoFilter();
  }, [entityId, entityType, accessStatus.isChecking, accessStatus.hasAccess]);

  // Handle form actions - with access checking
  const checkAccessBeforeAction = (action) => {
    if (!accessStatus.hasAccess) {
      toastSet({
        isOpen: true,
        title: t("upgradeRequired"),
        text: accessStatus.reason,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleCountryChange = (country) => {
    setTempLocation((prev) => ({ ...prev, country }));
  };

  const handleStateChange = (state) => {
    setTempLocation((prev) => ({ ...prev, state }));
  };

  const handleCountryCodeChange = (country_code) => {
    setTempLocation((prev) => ({ ...prev, country_code }));
  };

  const handleStateCodeChange = (state_code) => {
    setTempLocation((prev) => ({ ...prev, state_code }));
  };

  const handleActiveChange = async (e) => {
    if (!checkAccessBeforeAction()) return;

    const newActive = e.target.checked;
    setActive(newActive);

    // Save directly using the new value
    await saveToDatabase({
      ...buildDataObject(),
      active: newActive,
    });
  };

  const handleModeChange = async (newMode) => {
    if (!checkAccessBeforeAction()) return;

    setMode(newMode);

    // Save directly using the new value
    await saveToDatabase({
      ...buildDataObject(),
      mode: newMode,
    });
  };

  const handleAddLocation = async () => {
    if (!checkAccessBeforeAction()) return;

    if (!tempLocation.country) {
      toastSet({
        isOpen: true,
        title: t("countryRequired"),
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates - use country_code and state_code for comparison if available
    const isDuplicate = locations.some((loc) => {
      // Primary check: code-based comparison (most reliable)
      if (tempLocation.country_code && loc.country_code) {
        if (tempLocation.state_code && loc.state_code) {
          return (
            tempLocation.country_code.toLowerCase() ===
              loc.country_code.toLowerCase() &&
            tempLocation.state_code.toLowerCase() ===
              loc.state_code.toLowerCase()
          );
        } else {
          return (
            tempLocation.country_code.toLowerCase() ===
              loc.country_code.toLowerCase() &&
            (!tempLocation.state || !loc.state)
          );
        }
      }

      // Fallback: name-based comparison
      return (
        loc.country.toLowerCase() === tempLocation.country.toLowerCase() &&
        (!tempLocation.state ||
          loc.state.toLowerCase() === tempLocation.state.toLowerCase())
      );
    });

    if (isDuplicate) {
      toastSet({
        isOpen: true,
        title: t("locationAlreadyInList"),
        variant: "destructive",
      });
      return;
    }

    // Create new array with the new location
    const updatedLocations = [...locations, { ...tempLocation }];

    // Update local state
    setLocations(updatedLocations);

    // Clear the temp location
    setTempLocation({
      country: "",
      state: "",
      country_code: "",
      state_code: "",
    });

    // Save directly with the updated locations array
    await saveToDatabase({
      ...buildDataObject(),
      locations: validateLocations(updatedLocations),
    });
  };

  // Helper function to build the data object for saving
  const buildDataObject = () => {
    const data = {
      entityId,
      entityType,
      mode: mode === "allow" || mode === "block" ? mode : "block",
      locations: validateLocations(locations),
      active: !!active,
    };

    console.log("Building geo filter data object:", data);
    return data;
  };

  // Helper function to save data to database
  const saveToDatabase = async (data) => {
    if (!checkAccessBeforeAction()) return null;

    setIsLoading(true);

    try {
      // Validate required fields
      if (!data.entityId || !data.entityType) {
        throw new Error("Missing required fields: entityId or entityType");
      }

      console.log("Saving geo filter:", data);

      let result;
      if (geoFilterId) {
        // Update existing filter
        result = await update({
          col: "geofilters",
          data: { _id: geoFilterId },
          update: data,
        });
      } else {
        // Create new filter
        result = await add({
          col: "geofilters",
          data,
        });
      }

      console.log(
        "Geo filter save result:",
        result ? "Success" : "Failed",
        result?._id ? `ID: ${result._id}` : ""
      );

      if (!result || result.error) {
        throw new Error(result?.error || "Failed to save geo filter");
      }

      // Update local state with the new filter ID if we created a new one
      if (result._id && !geoFilterId) {
        setGeoFilterId(result._id);
      }

      // Sync the geo filter data with the parent entity (landingpage or directlink)
      if (entityId && entityType) {
        const syncResult = await syncGeoFilterData(entityId, entityType);
        console.log(
          `Synced geo filter data to parent ${entityType}: ${
            syncResult ? "Success" : "Failed"
          }`
        );
      }

      toastSet({
        isOpen: true,
        title: t("geoFilterSaved"),
      });

      if (refreshPreview) {
        refreshPreview();
      }

      onComplete(result);
      return result;
    } catch (error) {
      console.error("Error saving geo filter:", error);
      console.error("Error details:", {
        message: error.message,
        entityId: data.entityId,
        entityType: data.entityType,
      });

      toastSet({
        isOpen: true,
        title: `${t("geoFilterSaveFailed")}: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Original handleSubmit now uses the saveToDatabase helper
  const handleSubmit = async () => {
    await saveToDatabase(buildDataObject());
  };

  const handleRemoveLocation = async (index) => {
    if (!checkAccessBeforeAction()) return;

    const updatedLocations = locations.filter((_, i) => i !== index);
    setLocations(updatedLocations);

    // Save changes immediately after removing a location
    await saveToDatabase({
      ...buildDataObject(),
      locations: validateLocations(updatedLocations),
    });
  };

  // Add a validation function to ensure location objects are properly structured
  const validateLocations = (locations) => {
    if (!Array.isArray(locations)) return [];

    return locations
      .map((loc) => ({
        country: typeof loc.country === "string" ? loc.country : "",
        state: typeof loc.state === "string" ? loc.state : "",
        country_code:
          typeof loc.country_code === "string" ? loc.country_code : "",
        state_code: typeof loc.state_code === "string" ? loc.state_code : "",
      }))
      .filter((loc) => loc.country); // Filter out any locations without a country
  };

  // Display upgrade required message - check this first, even if still loading
  if (!accessStatus.isChecking && !accessStatus.hasAccess) {
    return (
      <UpgradeMessageCard
        title="upgradeRequired"
        message={accessStatus.reason || "geoFilterRequiresCreatorPlan"}
        requiredPlan="creator"
        isFreeTrialPeriod={accessStatus.isFreeTrialPeriod}
        daysRemaining={accessStatus.daysRemaining}
        featureName="geoFiltering"
      />
    );
  }

  // Show loading state only if we're still loading AND we don't already know access is denied
  if (isLoading && !locations.length) {
    return (
      <div className="fcc p15">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
      </div>
    );
  }

  return (
    <div className="fc g15">
      <p className="text-sm text-muted-foreground">
        {t("geoFilterDescription")}
      </p>

      <div className="flex items-center mt-2">
        <FormActiveCheckbox
          isActive={active}
          onChange={handleActiveChange}
          customLabel={t("enableGeoFiltering")}
        />
      </div>

      <div
        className={`flex items-center space-x-6 mt-4 ${
          !active ? "opacity-20 pen" : ""
        }`}
      >
        <div
          className={`asstr bg-red-400 dark:bg-red-400 p10 br10 flex items-center ${
            mode === "block"
              ? "border-2 border-black dark:border-white shadow-md"
              : ""
          }`}
        >
          <input
            type="radio"
            id="mode-block"
            name="filter-mode"
            checked={mode === "block"}
            onChange={() => handleModeChange("block")}
            className="mr-2 h-4 w-4 text-primary border-gray-300 focus:ring-primary accent-primary"
          />
          <label
            htmlFor="mode-block"
            className="text-sm font-medium text-foreground cursor-pointer hover:text-primary"
          >
            {t("blockMode")}
          </label>
        </div>
        <div
          className={`asstr bg-green-400 dark:bg-green-400 p10 br10 flex items-center ${
            mode === "allow"
              ? "border-2 border-black dark:border-white shadow-md"
              : ""
          }`}
        >
          <input
            type="radio"
            id="mode-allow"
            name="filter-mode"
            checked={mode === "allow"}
            onChange={() => handleModeChange("allow")}
            className="mr-2 h-4 w-4 text-primary border-gray-300 focus:ring-primary accent-primary"
          />
          <label
            htmlFor="mode-allow"
            className="text-sm font-medium text-foreground cursor-pointer hover:text-primary"
          >
            {t("allowMode")}
          </label>
        </div>
      </div>

      <div
        className={`fc g10 mt-4 border p-4 rounded-md ${
          !active ? "opacity-20 pen" : ""
        }`}
      >
        <h4 className="font-medium">{t("addLocation")}</h4>
        <div className="fc gap-2">
          <div className="flex-1">
            <LocationSelector
              name="location-filter"
              onCountryChange={handleCountryChange}
              onStateChange={handleStateChange}
              onCountryCodeChange={handleCountryCodeChange}
              onStateCodeChange={handleStateCodeChange}
              defaultValue={tempLocation}
              stateRequired={false}
              className="fc g15"
            />
          </div>
          <div className="fc ml10">
            <Button
              as="div"
              onClick={handleAddLocation}
              disabled={!tempLocation.country}
              className="mb5"
            >
              {t("addToList")}
            </Button>
          </div>
        </div>
      </div>

      {locations.length > 0 && (
        <div className={`mt-4 ${!active ? "opacity-20 pen" : ""}`}>
          <div className="fc g10 mt-4 border p-4 rounded-md">
            <h4 className="font-medium">
              {mode === "block" ? t("blockedLocations") : t("allowedLocations")}
              :
            </h4>
            {[...locations]?.map((location, idx) => (
              <div
                key={idx}
                className={`!text-foreground flex justify-between items-center p-2 rounded ${
                  mode === "block"
                    ? "bg-red-400 text-red-800 dark:bg-red-400 dark:text-red-300"
                    : "bg-green-400 text-green-800 dark:bg-green-400 dark:text-green-300"
                }`}
              >
                <span>
                  {location.country}
                  {location.state && ` - ${location.state}`}
                </span>
                <div
                  onClick={() => handleRemoveLocation(idx)}
                  className="cp text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-100"
                  aria-label="Remove location"
                >
                  <XCircle className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
