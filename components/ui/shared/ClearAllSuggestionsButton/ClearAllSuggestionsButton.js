"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { clearAllSuggestions } from "@/lib/actions/clearAllSuggestions";

export default function ClearAllSuggestionsButton({
  currentUser,
  onSuccess,
  className = "",
  variant = "outline",
  size = "sm",
  children,
}) {
  const { t } = useTranslation();
  const { toastSet } = useContext();

  // Handle clearing ALL suggestion data (hidden suggestions + visited creator tags)
  const handleClearAllSuggestions = async () => {
    try {
      if (!currentUser?._id) return;

      // Clear all suggestion-related data
      const result = await clearAllSuggestions();

      if (result.error) {
        toastSet({
          title: t("error"),
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      // Show success toast
      toastSet({
        title: t("allSuggestionsCleared") || "All suggestions cleared",
        description:
          t("allSuggestionsDataReset") ||
          "Suggestion algorithm has been reset. Refreshing suggestions...",
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to clear all suggestions:", error);
      toastSet({
        title: t("error"),
        description:
          t("errorClearingAllSuggestions") || "Failed to clear all suggestions",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      onClick={handleClearAllSuggestions}
      variant={variant}
      size={size}
      className={className}
    >
      {children || t("resetSuggestions") || "Reset all suggestions"}
    </div>
  );
}
