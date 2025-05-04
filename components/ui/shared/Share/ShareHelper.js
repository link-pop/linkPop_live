"use client";

import { useContext } from "@/components/Context/Context";
import { useTranslation } from "@/components/Context/TranslationContext";

/**
 * Reusable sharing utility that uses Web Share API with clipboard fallback
 * @returns {Object} Functions for handling sharing
 */
export default function useShareHelper() {
  const { toastSet } = useContext();
  const { t } = useTranslation();

  /**
   * Share content using Web Share API with clipboard fallback
   * @param {Object} options - Share options
   * @param {string} options.url - URL to share (defaults to current page)
   * @param {string} options.title - Title of shared content
   * @param {string} options.text - Additional text for sharing
   * @param {Function} options.onSuccess - Callback when share succeeds
   * @param {Function} options.onError - Callback when share fails
   * @param {boolean} options.showToast - Whether to show toast notification on clipboard fallback
   * @returns {Promise<void>}
   */
  const shareContent = async ({
    url = window.location.href,
    title = "",
    text = "",
    onSuccess = null,
    onError = null,
    showToast = true,
  } = {}) => {
    // Create share data object
    const shareData = {
      url,
      ...(title && { title }),
      ...(text && { text }),
    };

    try {
      // Try using Web Share API first
      if (navigator.share) {
        await navigator.share(shareData);
        if (onSuccess) onSuccess();
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        if (showToast) {
          toastSet({
            isOpen: true,
            title: t("linkCopied") || "Link copied to clipboard",
          });
        }
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Share failed:", error);

      // Try clipboard as fallback for Web Share API failures
      try {
        await navigator.clipboard.writeText(url);
        if (showToast) {
          toastSet({
            isOpen: true,
            title: t("linkCopied") || "Link copied to clipboard",
          });
        }
        if (onSuccess) onSuccess();
      } catch (clipboardError) {
        console.error("Clipboard fallback failed:", clipboardError);
        if (onError) onError(error);
      }
    }
  };

  return {
    shareContent,
  };
}
