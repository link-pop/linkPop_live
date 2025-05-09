"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import ColorPicker from "../ColorPicker/ColorPicker";
import { MENU_CLASS } from "@/lib/utils/constants";

// TODO !!!!!!! I need the following comps to save data NOT to locastorage BUT to @UserModel.js
export default function ThemeSettings({ className = "" }) {
  const [brandColor, setBrandColor] = useState("#8cf1d7");
  const ref = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    // Load saved color from localStorage
    const savedColor = localStorage.getItem("brandColor");
    if (savedColor) {
      setBrandColor(savedColor);
      updateRootColor(savedColor);
    }
  }, []);

  const updateRootColor = (color) => {
    document.documentElement.style.setProperty("--color-brand", color);
    localStorage.setItem("brandColor", color);
  };

  const handleColorChange = (newColor) => {
    setBrandColor(newColor);
    updateRootColor(newColor);
  };

  return (
    <div
      onClick={() => ref.current.click()}
      className={`${MENU_CLASS} ${className}`}
    >
      <ColorPicker
        defaultColor={brandColor}
        onColorChange={handleColorChange}
        ref={ref}
        label={t("customColor")}
        labelClassName="ml-[-1px]"
      />
    </div>
  );
}
