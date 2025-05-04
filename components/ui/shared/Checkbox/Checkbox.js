"use client";

import { Checkbox as _Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import useInputMemo from "../Input/useInputMemo";

export default function Checkbox({
  name,
  required,
  defaultChecked = false,
  onChange,
  className,
  label,
}) {
  const { onChange: onValueChange, defaultValue } = useInputMemo({ 
    name, 
    onChange,
    defaultValue: defaultChecked 
  });

  // Convert string 'true'/'false' from localStorage to actual boolean
  const getMemoValue = () => {
    const value = defaultValue();
    if (value === 'true') return true;
    if (value === 'false') return false;
    return defaultChecked;
  };

  const [checked, setChecked] = useState(getMemoValue());

  const handleChange = (value) => {
    setChecked(value);
    // Convert boolean to string for localStorage
    onValueChange(String(value));
  };

  return (
    <div className="flex items-center space-x-2">
      <_Checkbox
        id={name}
        name={name}
        required={required}
        checked={checked}
        onCheckedChange={handleChange}
        className={className}
      />
      <Label htmlFor={name}>
        {label}
        {required && " *"}
      </Label>
      {name && (
        <input
          className="sr-only"
          type="checkbox"
          name={name}
          checked={checked}
          onChange={() => {}}
          aria-hidden="true"
          value="true"
        />
      )}
    </div>
  );
}
