"use client";

import { useTranslation } from "@/components/Context/TranslationContext";

/**
 * DateSeparator component for chat messages
 * Shows date delimiters like "Today", "Yesterday", "Mar 15", etc.
 */
export default function DateSeparator({ dateString, className = "" }) {
  const { t } = useTranslation();

  // Translate common date strings
  const getTranslatedDateString = (str) => {
    if (str.toLowerCase() === "today") {
      return t("today");
    }
    if (str.toLowerCase() === "yesterday") {
      return t("yesterday");
    }
    // For other dates (like "Mar 15"), return as is
    return str;
  };

  return (
    <div className={`flex items-center justify-center my-4 ${className}`}>
      <div className="flex-grow border-t border-border"></div>
      <span className="px-4 py-1 mx-4 text-sm text-muted-foreground bg-background border border-border rounded-full">
        {getTranslatedDateString(dateString)}
      </span>
      <div className="flex-grow border-t border-border"></div>
    </div>
  );
}
