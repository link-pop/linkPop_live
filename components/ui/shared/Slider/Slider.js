"use client";

import { cn } from "@/lib/utils";
import { Slider as _Slider } from "@/components/ui/slider";
import { useState } from "react";

export function Slider({ className, ...props }) {
  const [sliderValue, setSliderValue] = useState([0, 100]); // Initial value

  const handleSliderChange = (newValue) => {
    setSliderValue(newValue);
  };

  return (
    <_Slider
      value={sliderValue}
      onValueChange={handleSliderChange}
      max={100}
      step={1}
      className={cn("w-[100%]", className)}
      {...props}
    />
  );
}
