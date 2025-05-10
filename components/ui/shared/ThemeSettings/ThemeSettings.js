"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import ColorPicker from "../ColorPicker/ColorPicker";
import { MENU_CLASS } from "@/lib/utils/constants";
import { SITE1 } from "@/config/env";
import { X } from "lucide-react";

// TODO !!!!!!! I need the following comps to save data NOT to locastorage BUT to @UserModel.js
export default function ThemeSettings({ className = "" }) {
  const [brandColor, setBrandColor] = useState("#8cf1d7");
  const [appTextColor, setAppTextColor] = useState("");
  const [userSetTextColor, setUserSetTextColor] = useState(false);
  const brandColorRef = useRef(null);
  const textColorRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    // Load saved colors from localStorage
    const savedBrandColor = localStorage.getItem("brandColor");
    const savedTextColor = localStorage.getItem("appTextColor");

    if (savedBrandColor) {
      setBrandColor(savedBrandColor);
      updateRootColor(savedBrandColor);
    }

    if (savedTextColor) {
      setAppTextColor(savedTextColor);
      updateTextColor(savedTextColor);
      setUserSetTextColor(true);
    } else {
      setUserSetTextColor(false);
      // Default text color for the color picker display only
      setAppTextColor(SITE1 ? "#ffffff" : "#000000");
    }
  }, []);

  const updateRootColor = (color) => {
    document.documentElement.style.setProperty("--color-brand", color);
    localStorage.setItem("brandColor", color);
  };

  const updateTextColor = (color) => {
    document.documentElement.style.setProperty("--color-text", color);
    localStorage.setItem("appTextColor", color);
    setUserSetTextColor(true);
  };

  const handleBrandColorChange = (newColor) => {
    setBrandColor(newColor);
    updateRootColor(newColor);
  };

  const handleTextColorChange = (newColor) => {
    setAppTextColor(newColor);
    updateTextColor(newColor);
  };

  // Reset text color to use the BRAND_INVERT_CLASS logic
  const resetTextColor = () => {
    localStorage.removeItem("appTextColor");
    setUserSetTextColor(false);
    setAppTextColor(SITE1 ? "#ffffff" : "#000000"); // Reset to default display value
    document.documentElement.style.removeProperty("--color-text");
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        onClick={() => brandColorRef.current.click()}
        className={`${MENU_CLASS}`}
      >
        <ColorPicker
          defaultColor={brandColor}
          onColorChange={handleBrandColorChange}
          ref={brandColorRef}
          label={t("customColor")}
          labelClassName="ml-[-1px]"
        />
      </div>

      <div className="flex items-center">
        <div
          onClick={() => textColorRef.current.click()}
          className={`${MENU_CLASS} flex-grow`}
        >
          <ColorPicker
            defaultColor={appTextColor}
            onColorChange={handleTextColorChange}
            ref={textColorRef}
            label={t("textColor")}
            labelClassName="ml-[-1px]"
          />

          {/* // ! don't uncomment this */}
          {/* {userSetTextColor && (
            <div
              onClick={resetTextColor}
              className="ml-2 text-sm cursor-pointer hover:underline"
            >
              <X className="w-4 h-4" />
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
