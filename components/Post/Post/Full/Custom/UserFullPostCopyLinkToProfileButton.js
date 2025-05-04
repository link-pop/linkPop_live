"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { Copy } from "lucide-react";
import { useContext } from "@/components/Context/Context";
import RoundIconButton from "@/components/ui/shared/RoundIconButton/RoundIconButton";

export default function UserFullPostCopyLinkToProfileButton() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const { toastSet } = useContext();

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopyLink = () => {
    // Get the current URL
    const currentUrl = window.location.href;

    // Copy to clipboard
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        setCopied(true);
        toastSet({ isOpen: true, title: t("copiedProfileLinkToClipboard") });
      })
      .catch((error) => {
        console.error("Failed to copy URL to clipboard:", error);
      });
  };

  return (
    <RoundIconButton
      onClick={handleCopyLink}
      className={copied ? "aconfetti" : ""}
      title={t("copyLinkToProfile")}
    >
      <Copy size={16} className="brand" />
    </RoundIconButton>
  );
}
