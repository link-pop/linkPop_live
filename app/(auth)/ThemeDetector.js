"use client";

import { useEffect } from "react";

const ThemeDetector = () => {
  useEffect(() => {
    // Check if there's already a theme in localStorage
    const savedTheme = localStorage.getItem("theme");

    if (!savedTheme) {
      // If no theme is set, check for system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const systemTheme = prefersDark ? "dark" : "light";

      // Set theme in localStorage
      localStorage.setItem("theme", systemTheme);

      // Apply theme to document
      document.documentElement.classList.toggle("dark", systemTheme === "dark");
    }
  }, []);

  return null;
};

export default ThemeDetector;
