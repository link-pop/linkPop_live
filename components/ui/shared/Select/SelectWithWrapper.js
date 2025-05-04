"use client";

import { cn } from "@/lib/utils";
import Select from "./Select";

export default function SelectWithWrapper({
  value,
  onValueChange,
  options,
  leftIcon = true,
  wrapperClassName = "",
  className = "wf",
  label,
  customLabelText,
}) {
  const renderLabel = () => {
    if (customLabelText) {
      return customLabelText;
    }

    if (!value || !options || !options.length) {
      return label || "Select";
    }

    const selectedOption = options.find((opt) => opt.value === value);
    if (selectedOption) {
      return `${label ? label + ": " : ""}${selectedOption.label}`;
    }

    return label || "Select";
  };

  return (
    <div
      className={cn(
        "por f mxa g10 bg-accent px20 py5 br20 w320 hover:scale-105",
        wrapperClassName
      )}
    >
      <div className="poa t13 l53 pen fz14 z1 px5 text-foreground">
        {renderLabel()}
      </div>
      <Select
        value={value}
        onValueChange={onValueChange}
        options={options}
        className={`!border-0 !border-none ${className}`}
        leftIcon={leftIcon}
      />
    </div>
  );
}
