"use client";

import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RegularLabel } from "@/components/ui/shared/Input/FloatingLabelInput";

// Import JSON data for fallback
import countries from "@/data/countries.json";
import states from "@/data/states.json";
import { useTranslation } from "../Context/TranslationContext";

const LocationSelector = forwardRef(function LocationSelector(
  {
    disabled,
    onCountryChange,
    onStateChange,
    className = "",
    defaultValue = {},
    hideState = false,
    label = "",
    stateLabel = "",
    required = false,
    stateRequired = false,
    isStateOnly = false,
    uniqueCountries = [],
    uniqueStates = [],
    outerLabel = false
  },
  ref
) {

  const { t } = useTranslation("geoFilter");
  label = label || t("country");
  stateLabel = stateLabel || t("state");

  // Find default country and state from the data
  const defaultCountry = defaultValue.country
    ? countries.find((c) => c.name === defaultValue.country)
    : null;

  const defaultState = defaultValue.state
    ? states.find(
        (s) =>
          s.name === defaultValue.state &&
          (!defaultCountry || s.country_id === defaultCountry?.id)
      )
    : null;

  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [selectedState, setSelectedState] = useState(defaultState);
  const [openCountryDropdown, setOpenCountryDropdown] = useState(false);
  const [openStateDropdown, setOpenStateDropdown] = useState(false);

  // Update selected values when defaultValue changes
  useEffect(() => {
    const country = defaultValue.country
      ? countries.find((c) => c.name === defaultValue.country)
      : null;
    const state = defaultValue.state
      ? states.find(
          (s) =>
            s.name === defaultValue.state &&
            (!country || s.country_id === country?.id)
        )
      : null;

    setSelectedCountry(country);
    setSelectedState(state);
  }, [defaultValue]);

  // Use unique countries if provided, otherwise use all countries
  const countriesData = uniqueCountries.length > 0
    ? uniqueCountries.map((name) => {
        const country = countries.find((c) => c.name === name);
        return country || { id: name, name, emoji: "🌍" }; // Fallback if country not found
      })
    : countries;

  // Use unique states if provided, otherwise filter by selected country
  const availableStates = uniqueStates.length > 0
    ? uniqueStates.map((name) => {
        const state = states.find((s) => s.name === name);
        return state || { id: name, name, country_id: selectedCountry?.id };
      })
    : states.filter((state) => state.country_id === selectedCountry?.id);

  useImperativeHandle(ref, () => ({
    closeCountrySelect: () => {
      setOpenCountryDropdown(false);
    },
  }));

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setSelectedState(null); // Reset state when country changes
    onCountryChange?.({
      name: country?.name,
      id: country?.id,
      code: country?.iso2 || country?.country_code  // Add country code
    });
    onStateChange?.(null);
    setOpenCountryDropdown(false);
  };

  const handleStateSelect = (state) => {
    setSelectedState(state);
    onStateChange?.({
      name: state?.name,
      id: state?.id,
      code: state?.state_code  // Add state code
    });
    setOpenStateDropdown(false);
  };

  return (
    <div className={cn("f", className)}>
      {!isStateOnly && (
        <>
          {outerLabel && <RegularLabel required={required}>{label}</RegularLabel>}
          <Popover
            open={openCountryDropdown}
            onOpenChange={setOpenCountryDropdown}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCountryDropdown}
                disabled={disabled}
                className="w-full justify-between bg-transparent px-[var(--px-select)]"
              >
                {selectedCountry ? (
                  <div className="flex items-center gap-2">
                    <span>{selectedCountry.emoji}</span>
                    <span>{selectedCountry.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-500">
                    {label.toLowerCase()}
                  </span>
                )}
                <ChevronsUpDown
                  style={{ width: 13, height: 13 }}
                  className="opacity-50"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search country..."
                  className="bg-transparent"
                />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    <ScrollArea className="max-h-[300px] overflow-y-auto">
                      {countriesData.map((country) => (
                        <CommandItem
                          key={country.id}
                          value={country.name}
                          onSelect={() => handleCountrySelect(country)}
                          className="flex cursor-pointer items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span>{country.emoji}</span>
                            <span>{country.name}</span>
                          </div>
                          <Check
                            className={cn(
                              "h-4 w-4",
                              selectedCountry?.id === country.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                      <ScrollBar orientation="vertical" />
                    </ScrollArea>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </>
      )}
      {(!hideState || isStateOnly) && (
        <>
          {outerLabel && <RegularLabel required={stateRequired}>{stateLabel}</RegularLabel>}
          <Popover open={openStateDropdown} onOpenChange={setOpenStateDropdown}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openStateDropdown}
                disabled={!isStateOnly && !selectedCountry}
                className="w-full justify-between bg-transparent px-[var(--px-select)]"
              >
                {selectedState ? (
                  <span>{selectedState.name}</span>
                ) : (
                  <span className="text-gray-500">
                    {stateLabel.toLowerCase()}
                  </span>
                )}
                <ChevronsUpDown
                  style={{ width: 13, height: 13 }}
                  className="opacity-50"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search state..."
                  className="bg-transparent"
                />
                <CommandList>
                  <CommandEmpty>No state found.</CommandEmpty>
                  <CommandGroup>
                    <ScrollArea className="max-h-[300px] overflow-y-auto">
                      {availableStates.map((state) => (
                        <CommandItem
                          key={state.id}
                          value={state.name}
                          onSelect={() => handleStateSelect(state)}
                          className="flex cursor-pointer items-center justify-between text-sm"
                        >
                          <span>{state.name}</span>
                          <Check
                            className={cn(
                              "h-4 w-4",
                              selectedState?.id === state.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                      <ScrollBar orientation="vertical" />
                    </ScrollArea>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
});

export default LocationSelector;
