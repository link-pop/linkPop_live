"use client";

import { useEffect } from "react";

// This component initializes the color variables from localStorage on page load
export default function ThemeColorInitializer() {
  useEffect(() => {
    // Initialize brand color
    const savedBrandColor = localStorage.getItem("brandColor");
    if (savedBrandColor) {
      document.documentElement.style.setProperty(
        "--color-brand",
        savedBrandColor
      );
    }

    // Initialize text color
    const savedTextColor = localStorage.getItem("appTextColor");
    if (savedTextColor) {
      document.documentElement.style.setProperty(
        "--color-text",
        savedTextColor
      );
    }
  }, []);

  // This component doesn't render anything
  return null;
}
