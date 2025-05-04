"use client";

import { useEffect } from "react";

const ClerkThemeStyles = () => {
  useEffect(() => {
    // Create a style element
    const styleElement = document.createElement("style");
    styleElement.id = "clerk-theme-overrides";

    // Define the CSS overrides for light and dark themes
    styleElement.textContent = `
      /* Light theme styles (default) */
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
      
      .cl-footer{
        background: transparent !important;
      }
      
      .cl-footerActionLink {
        color: var(--color-brand) !important;
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
      
      /* Dark theme-specific overrides */
      .dark .cl-card {
        background-color: hsl(var(--card)) !important;
        color: hsl(var(--foreground)) !important;
      }
      
      .dark .cl-formFieldInput, .dark .cl-input {
        background-color: hsl(var(--input)) !important;
        border-color: hsl(var(--border)) !important;
        color: hsl(var(--foreground)) !important;
      }
      
      .dark .cl-formButtonPrimary, .dark .cl-button[data-color="primary"] {
        color: var(--color-white) !important;
      }
      
      .dark .cl-headerTitle, .dark .cl-headerSubtitle {
        color: hsl(var(--foreground)) !important;
      }
      
      .dark .cl-dividerText, .dark .cl-footerActionText {
        color: hsl(var(--muted-foreground)) !important;
      }
      
      .dark .cl-dividerLine {
        background-color: hsl(var(--border)) !important;
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
