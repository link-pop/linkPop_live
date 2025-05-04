"use client";

import { useEffect } from "react";

export default function HideLeftNav() {
  useEffect(() => {
    const leftNav = document.querySelector(".LeftNav");
    if (leftNav) {
      // Store original display value or default to "block"
      const originalDisplay = leftNav.style.display || "";

      // Hide the left navigation
      leftNav.style.display = "none";

      // Cleanup: restore the original display when component unmounts
      return () => {
        if (leftNav) {
          // We need to restore display to make it visible again
          // "" will use the default display value defined in CSS
          leftNav.style.display = "";
        }
      };
    }
  }, []);

  return null;
}