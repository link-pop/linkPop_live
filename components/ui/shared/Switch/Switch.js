"use client";

import { Label } from "@/components/ui/label";
import { Switch as _Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";

// ! used in Qookeys
export default function Switch({
  name,
  label = "switch",
  isChecked,
  onCheckedChange,
  defaultValue,
  required = false,
  className = "",
  inputClassName = "",
  labelClassName = "",
}) {
  // Use local state for uncontrolled component (with defaultValue)
  const [localChecked, setLocalChecked] = useState(defaultValue);

  // Determine if we're in controlled or uncontrolled mode
  const isControlled = isChecked !== undefined;
  const checked = isControlled ? isChecked : localChecked;

  const handleChange = (value) => {
    // Update local state if uncontrolled
    if (!isControlled) {
      setLocalChecked(value);
    }
    // Call external handler if provided
    if (onCheckedChange) {
      onCheckedChange(value);
    }
  };

  // Update local state if defaultValue changes
  useEffect(() => {
    if (!isControlled && defaultValue !== undefined) {
      setLocalChecked(defaultValue);
    }
  }, [defaultValue, isControlled]);

  return (
    <Label className={`wfc f aic g5 cp ${className}`}>
      <_Switch
        checked={checked}
        onCheckedChange={handleChange}
        className={inputClassName}
      />
      <span className={labelClassName}>
        {label}
        {required && " *"}
      </span>
      {name && (
        <input
          className={`sr-only`}
          type="checkbox"
          name={name}
          required={required}
          checked={checked}
          onChange={() => {}}
          aria-hidden="true"
        />
      )}
    </Label>
  );
}
