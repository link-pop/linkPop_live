"use client";

import { useEffect } from "react";

const ThemeDetector = () => {
  useEffect(() => {
    // Always set theme to dark
    localStorage.setItem("theme", "dark");
    document.documentElement.classList.add("dark");
  }, []);

  return null;
};

export default ThemeDetector;
