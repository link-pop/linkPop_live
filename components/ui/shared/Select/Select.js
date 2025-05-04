"use client";

import {
  Select as _Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FloatingLabel } from "@/components/ui/shared/Input/FloatingLabelInput";
import { ChevronsUpDown } from "lucide-react";
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";

// Custom SelectTrigger without right arrow icon
const SelectTriggerNoArrow = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        "pl-[12px]",
        "data-[placeholder]:text-muted-foreground",
        "border border-border dark:border-gray-600",
        className
      )}
      {...props}
    >
      {children}
      {/* No icon here */}
    </SelectPrimitive.Trigger>
  )
);
SelectTriggerNoArrow.displayName = "SelectTriggerNoArrow";

export default function Select({
  value,
  onValueChange,
  options,
  className = "",
  label,
  required = false,
  placeholder,
  renderOption,
  disabled = false,
  leftIcon = false,
  version = "old",
}) {
  // Add an additional class for styling purposes
  const triggerClassName = leftIcon ? "select-left-icon" : "";

  // For new version: selected option and label logic
  const selectedOption = options.find((opt) => opt.value === value);
  const getOptionLabel = (option) => {
    if (!option) return null;
    return renderOption ? renderOption(option) : option.label;
  };

  // Conditional rendering for old/new version
  if (version === "old") {
    // OLD VERSION: renderOption only for selected value, not for list
    return (
      <div className={`por ${className}`}>
        {label && <FloatingLabel required={required}>{label}</FloatingLabel>}
        <_Select
          value={value || ""}
          onValueChange={onValueChange}
          disabled={disabled}
        >
          <SelectTriggerNoArrow
            className={`${className} ${
              leftIcon ? "!pl-2 !pr-3" : ""
            } ${triggerClassName} border border-input`}
          >
            {leftIcon && (
              <ChevronsUpDown className="por r5 h-4 w-4 mr-2 opacity-50" />
            )}
            <SelectValue placeholder={placeholder}>
              {value && renderOption
                ? renderOption(options.find((opt) => opt.value === value))
                : null}
            </SelectValue>
          </SelectTriggerNoArrow>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </_Select>
      </div>
    );
  }

  // NEW VERSION: renderOption for both selected and list items
  return (
    <div className={`por ${className}`}>
      {label && <FloatingLabel required={required}>{label}</FloatingLabel>}
      <_Select
        value={value || ""}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          className={`${className} ${
            leftIcon ? "!pl-2 !pr-3" : ""
          } ${triggerClassName} border border-input`}
        >
          {leftIcon && (
            <ChevronsUpDown className="por r5 h-4 w-4 mr-2 opacity-50" />
          )}
          <SelectValue placeholder={placeholder}>
            {selectedOption ? getOptionLabel(selectedOption) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {getOptionLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </_Select>
    </div>
  );
}
