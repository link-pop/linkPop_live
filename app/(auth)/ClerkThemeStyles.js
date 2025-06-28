"use client";

import { useEffect } from "react";

const ClerkThemeStyles = () => {
  useEffect(() => {
    // Create a style element
    const styleElement = document.createElement("style");
    styleElement.id = "clerk-theme-overrides";

    // Only dark theme-specific overrides
    styleElement.textContent = `
      .cl-card {
        background-color: hsl(var(--card)) !important;
        color: hsl(var(--foreground)) !important;
      }
      .cl-formFieldInput, .cl-input {
        background-color: hsl(var(--input)) !important;
        border-color: hsl(var(--border)) !important;
        color: hsl(var(--foreground)) !important;
      }
      .cl-formButtonPrimary, .cl-button[data-color="primary"] {
        color: var(--color-white) !important;
      }
      .cl-headerTitle, .cl-headerSubtitle {
        color: hsl(var(--foreground)) !important;
      }
      .cl-dividerText, .cl-footerActionText {
        color: hsl(var(--muted-foreground)) !important;
      }
      .cl-dividerLine {
        background-color: hsl(var(--border)) !important;
      }
      .cl-footer{
        background: transparent !important;
      }
      .cl-footerActionLink {
        color: var(--color-brand) !important;
      }
    `;

    // Add the style element to the document head
    document.head.appendChild(styleElement);

    // Clean up function to remove the style when component unmounts
    return () => {
      const existingStyle = document.getElementById("clerk-theme-overrides");
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return null;
};

export default ClerkThemeStyles;
