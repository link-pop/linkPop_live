"use client";

import { CheckIcon, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RegularLabel } from "@/components/ui/shared/Input/FloatingLabelInput";
import useInputMemo from "../Input/useInputMemo";

const FlagComponent = ({ country, countryName, useFlags = false }) => {
  const Flag = flags[country];

  if (useFlags && Flag) {
    return (
      <span className="fcc h-4 w-6 overflow-hidden rounded-sm">
        <Flag title={countryName} />
      </span>
    );
  }

  return (
    <span className="flex h-4 w-6 items-center justify-center overflow-hidden rounded-sm text-xs font-medium">
      {country}
    </span>
  );
};

const InputComponent = React.forwardRef(({ className, ...props }, ref) => (
  <Input
    className={cn("h-10 rounded-s-none rounded-e-lg", className)}
    {...props}
    ref={ref}
  />
));
InputComponent.displayName = "InputComponent";

const CountrySelectOption = ({
  country,
  countryName,
  selectedCountry,
  onChange,
  useFlags,
}) => {
  return (
    <CommandItem className="gap-2" onSelect={() => onChange(country)}>
      <FlagComponent
        country={country}
        countryName={countryName}
        useFlags={useFlags}
      />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-sm text-foreground/50">{`+${RPNInput.getCountryCallingCode(
        country
      )}`}</span>
      <CheckIcon
        className={`ml-auto size-4 ${
          country === selectedCountry ? "opacity-100" : "opacity-0"
        }`}
      />
    </CommandItem>
  );
};

const CountrySelect = ({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
  useFlags,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="flex h-10 gap-1 rounded-s-lg rounded-e-none border-r-0 px-3 focus:z-10 border-2"
          disabled={disabled}
        >
          <FlagComponent
            country={selectedCountry}
            countryName={selectedCountry}
            useFlags={useFlags}
          />
          <ChevronsUpDown
            // HACK: force size with border
            className={cn(
              "border-2 border-[transparent] h15 w15 -mr-2 opacity-50",
              disabled ? "hidden" : "opacity-100"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <ScrollArea className="h-72">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countryList.map(({ value, label }) =>
                  value ? (
                    <CountrySelectOption
                      key={value}
                      country={value}
                      countryName={label}
                      selectedCountry={selectedCountry}
                      onChange={onChange}
                      useFlags={useFlags}
                    />
                  ) : null
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const PhoneInput = React.forwardRef(
  (
    {
      className,
      onChange,
      required = false,
      useFlags = true,
      label,
      id,
      name,
      value,
      ...props
    },
    ref
  ) => {
    const [isValid, setIsValid] = useState(false);
    const { onChange: onMemoChange, defaultValue } = useInputMemo({
      name,
      onChange,
      defaultValue: value,
    });

    const validateAndSetValue = (value) => {
      if (!value) {
        setIsValid(false);
        onMemoChange(value);
        return;
      }

      // Check if the phone number is valid (not just country code)
      const isValidNumber = RPNInput.isValidPhoneNumber(value);
      setIsValid(isValidNumber);

      // Get the full formatted value including country code and number
      const formattedValue = RPNInput.formatPhoneNumber(value, "INTERNATIONAL");
      onMemoChange(formattedValue);
    };

    // Validate memo value on mount
    useEffect(() => {
      const memoValue = defaultValue();
      if (memoValue) {
        validateAndSetValue(memoValue);
      }
    }, []);

    return (
      <div className="space-y-1.5">
        {label && (
          <RegularLabel htmlFor={id} required={required}>
            {label}
          </RegularLabel>
        )}
        <div className={cn("relative", className)}>
          <RPNInput.default
            ref={ref}
            id={id}
            name={name}
            className="flex"
            flagComponent={(props) => (
              <FlagComponent {...props} useFlags={useFlags} />
            )}
            countrySelectComponent={(props) => (
              <CountrySelect {...props} useFlags={useFlags} />
            )}
            inputComponent={InputComponent}
            smartCaret={false}
            international={true}
            withCountryCallingCode={true}
            defaultCountry="UA"
            onChange={validateAndSetValue}
            value={defaultValue()}
            {...props}
          />
          {/* Hidden input for form validation */}
          <input
            tabIndex={-1}
            className="sr-only"
            required={required}
            value={isValid ? "valid" : ""}
          />
        </div>
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
