"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useTranslation } from "../Context/TranslationContext";

/**
 * CopyLinkButton - A reusable button to copy a link to the clipboard.
 * @param {string} name - The unique name/username to copy (used as the URL path).
 * @param {string} [className] - Optional extra class for styling.
 * @param {string} [label] - Optional button label (default: "copy").
 */
export default function CopyLinkButton({
  name,
  className = "",
  label = "copy",
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!name || typeof name !== "string" || name.trim() === "") return null;

  const handleClick = (e) => {
    e.preventDefault();
    // Get the current origin (domain) of the site
    const origin = window.location.origin;
    // Create the full URL
    const url = `${origin}/${name}`;

    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`${className}`} onClick={handleClick}>
      <div className="mxa brand wsn fcc g5 aic fwn wfc cp hover:underline">
        {copied ? t("copied") || "Copied" : t(label)}
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </div>
    </div>
  );
}
