"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import ShareModal from "./ShareModal";
import { useContext } from "@/components/Context/Context";
import { useState } from "react";

/**
 * Reusable sharing utility that uses custom share modal on desktop and Web Share API on mobile
 * @returns {Object} Functions for handling sharing
 */
export default function useShareHelper() {
  const { toastSet } = useContext();
  const { t } = useTranslation();
  const [shareModalState, setShareModalState] = useState({
    isOpen: false,
    url: "",
    title: "",
    text: "",
    image: null,
  });

  /**
   * Share content using custom share modal on desktop and Web Share API on mobile
   * @param {Object} options - Share options
   * @param {string} options.url - URL to share (defaults to current page)
   * @param {string} options.title - Title of shared content
   * @param {string} options.text - Additional text for sharing
   * @param {string} options.image - Optional image URL for share preview
   * @param {Function} options.onSuccess - Callback when share succeeds
   * @param {Function} options.onError - Callback when share fails
   * @param {boolean} options.showToast - Whether to show toast notification on clipboard fallback
   * @param {boolean} options.forceNative - Force using native share if available (bypass custom modal)
   * @returns {Promise<void>}
   */
  const shareContent = async ({
    url = window.location.href,
    title = "",
    text = "",
    image = null,
    onSuccess = null,
    onError = null,
    showToast = true,
    forceNative = false,
  } = {}) => {
    // Create share data object
    const shareData = {
      url,
      ...(title && { title }),
      ...(text && { text }),
    };

    try {
      // Check if we're on mobile or if forceNative is true
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      // Use Web Share API for mobile devices or when forceNative is true
      if ((isMobile || forceNative) && navigator.share) {
        await navigator.share(shareData);
        if (onSuccess) onSuccess();
      } else {
        // On desktop, use our custom share modal
        setShareModalState({
          isOpen: true,
          url,
          title,
          text,
          image,
        });
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

  // Close share modal handler
  const closeShareModal = () => {
    setShareModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  return {
    shareContent,
    shareModalState,
    closeShareModal,
  };
}
