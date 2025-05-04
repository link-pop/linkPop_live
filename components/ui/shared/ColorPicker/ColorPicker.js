"use client";

import { useEffect, useState, forwardRef, useRef } from "react";

export default forwardRef(function ColorPicker(
  { defaultColor, color, onColorChange, label, className = "" },
  ref
) {
  const [selectedColor, setSelectedColor] = useState(
    color || defaultColor || "#000000"
  );
  const colorInputRef = useRef(null);
  const actualRef = ref || colorInputRef;

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setSelectedColor(newColor);
    onColorChange(newColor);
  };

  const triggerColorPicker = () => {
    if (actualRef.current) {
      actualRef.current.click();
    }
  };

  useEffect(() => {
    if (color !== undefined) {
      setSelectedColor(color);
    } else if (defaultColor !== undefined) {
      setSelectedColor(defaultColor);
    }
  }, [color, defaultColor]);

  return (
    <div
      className={`f fwn aic jcsb ${className} transition-transform duration-300 ease-in-out cursor-pointer`}
      onClick={triggerColorPicker}
    >
      <div className="f fwn aic g10 relative">
        <input
          type="color"
          value={selectedColor}
          onChange={handleColorChange}
          className={`w24 h28 cp !bg-transparent`}
          ref={actualRef}
          onClick={(e) => e.stopPropagation()}
        />
        {label && (
          <span
            className={`text-sm text-foreground cp ml-1 relative z-10 transition-opacity duration-200`}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
});
