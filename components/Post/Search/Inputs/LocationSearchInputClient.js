"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LocationSelector from "@/components/ui/shared/LocationSelector/LocationSelector";
import ClearPostsSearchInputIcon from "../ClearPostsSearchInputIcon";

export default function LocationSearchInputClient({
  col,
  nameInSearchParams,
  searchParams,
  uniqueCountries,
  uniqueStates,
  isStateInput,
  defaultCountry,
  defaultState,
}) {
  const router = useRouter();
  const [resetKey, setResetKey] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [selectedState, setSelectedState] = useState(defaultState);

  const stateFieldName = isStateInput
    ? nameInSearchParams
    : `${nameInSearchParams} state`;

  useEffect(() => {
    const newSearchParams = new URLSearchParams(window.location.search);
    if (isStateInput) {
      // For state-only inputs, only update the state parameter
      if (selectedState) {
        newSearchParams.set(nameInSearchParams, selectedState);
      } else {
        newSearchParams.delete(nameInSearchParams);
      }
    } else {
      // For country inputs, update both country and state parameters
      if (selectedCountry) {
        newSearchParams.set(nameInSearchParams, selectedCountry);
      } else {
        newSearchParams.delete(nameInSearchParams);
      }
      if (selectedState) {
        newSearchParams.set(stateFieldName, selectedState);
      } else {
        newSearchParams.delete(stateFieldName);
      }
    }
    router.push(`${col.name.toLowerCase()}?${newSearchParams.toString()}`);
  }, [
    selectedCountry,
    selectedState,
    nameInSearchParams,
    col,
    router,
    stateFieldName,
    isStateInput,
  ]);

  const handleCountryChange = (country) => {
    if (!isStateInput) {
      setSelectedCountry(country || "");
      setSelectedState(""); // Clear state when country changes
    }
  };

  const handleStateChange = (state) => {
    setSelectedState(state?.name || "");
  };

  const handleClearState = () => {
    if (isStateInput) {
      setSelectedState("");
    } else {
      setSelectedCountry("");
      setSelectedState("");
    }
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className="fcc fwn">
      <LocationSelector
        key={resetKey}
        onCountryChange={handleCountryChange}
        onStateChange={handleStateChange}
        className="fc"
        btnClassName={`oh px-[var(--px-select)]`}
        defaultValue={{
          country: selectedCountry,
          state: selectedState,
        }}
        uniqueCountries={uniqueCountries}
        uniqueStates={uniqueStates}
        label={nameInSearchParams}
        hideState={col?.settings?.fields?.[nameInSearchParams]?.hideState}
        isStateOnly={isStateInput}
        name={nameInSearchParams}
      />
      <ClearPostsSearchInputIcon
        searchParams={searchParams}
        nameInSearchParams={nameInSearchParams}
        handleClearState={handleClearState}
        col={col}
        className="mt20"
      />
    </div>
  );
}
