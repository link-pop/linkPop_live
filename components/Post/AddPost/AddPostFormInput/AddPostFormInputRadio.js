"use client";

import RadioGroup from "@/components/ui/shared/RadioGroup/RadioGroup";
import { useState } from "react";

export default function AddPostFormInputRadio({
  name,
  required,
  defaultValue,
  className,
  options
}) {
  const [radioValue, setRadioValue] = useState(defaultValue || "");

  return (
    <div className={className}>
      <RadioGroup
        options={options}
        name={name}
        value={radioValue}
        onChange={setRadioValue}
        required={required}
      />
    </div>
  );
}
