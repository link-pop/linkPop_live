"use client";

import { useState, useEffect, useRef } from "react";
import LocationInput from "@/components/ui/location-input";
import states from "@/data/states.json";

export default function LocationSelector({
  name,
  onCountryChange,
  onStateChange,
  onCountryCodeChange = () => {},
  onStateCodeChange = () => {},
  className = "fc g15",
  btnClassName = "",
  defaultValue = {},
  required = false,
  stateRequired = false,
  hideState = false,
  label = "",
  isStateOnly = false,
  uniqueCountries = [],
  uniqueStates = [],
}) {
  const [countryName, setCountryName] = useState(defaultValue.country || "");
  const [stateName, setStateName] = useState(defaultValue.state || "");
  const [countryCode, setCountryCode] = useState(
    defaultValue.country_code || ""
  );
  const [stateCode, setStateCode] = useState(defaultValue.state_code || "");
  const [hasStates, setHasStates] = useState(false);
  const locationInputRef = useRef(null);

  // Check if a country has states
  const checkHasStates = (countryId) => {
    return !hideState && states.some((state) => state.country_id === countryId);
  };

  useEffect(() => {
    setCountryName(defaultValue.country || "");
    setStateName(defaultValue.state || "");
    setCountryCode(defaultValue.country_code || "");
    setStateCode(defaultValue.state_code || "");
  }, [defaultValue]);

  return (
    <div className={`r wf ${className}`}>
      <LocationInput
        ref={locationInputRef}
        defaultValue={{
          country: defaultValue.country,
          state: defaultValue.state,
          country_code: defaultValue.country_code,
          state_code: defaultValue.state_code,
        }}
        hideState={hideState}
        isStateOnly={isStateOnly}
        onCountryChange={(country) => {
          setCountryName(country?.name || "");
          setCountryCode(country?.code || "");
          setHasStates(country ? checkHasStates(country.id) : false);
          onCountryChange(country?.name || "");
          onCountryCodeChange(country?.code || "");
          locationInputRef.current?.closeCountrySelect?.();
        }}
        onStateChange={(state) => {
          setStateName(state?.name || "");
          setStateCode(state?.code || "");
          onStateChange(state?.name || "");
          onStateCodeChange(state?.code || "");
        }}
        className={className}
        btnClassName={btnClassName}
        required={required}
        stateRequired={stateRequired}
        label={label}
        uniqueCountries={uniqueCountries}
        uniqueStates={uniqueStates}
      />
      {!isStateOnly && (
        <>
          <input
            name={name}
            value={countryName}
            required={required}
            className="sr-only cx"
            tabIndex={-1}
          />
          <input
            name={`${name}_country_code`}
            value={countryCode}
            className="sr-only cx"
            tabIndex={-1}
          />
        </>
      )}
      {(!hideState || isStateOnly) && (
        <>
          <input
            name={`${name} state`}
            value={stateName}
            required={stateRequired && (hasStates || isStateOnly)}
            className="sr-only cx"
            tabIndex={-1}
          />
          <input
            name={`${name}_state_code`}
            value={stateCode}
            className="sr-only cx"
            tabIndex={-1}
          />
        </>
      )}
    </div>
  );
}
