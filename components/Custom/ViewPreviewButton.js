import React from "react";
import { ArrowUpRight, Eye } from "lucide-react";
import { useTranslation } from "../Context/TranslationContext";

/**
 * ViewPreviewButton - A reusable button to preview a landing page or directlink by name.
 * @param {string} name - The unique name/username to preview (used as the URL path).
 * @param {string} [className] - Optional extra class for styling.
 * @param {string} [label] - Optional button label (default: "view").
 */
export default function ViewPreviewButton({
  name,
  className = "",
  label = "view",
}) {
  const { t } = useTranslation();
  if (!name || typeof name !== "string" || name.trim() === "") return null;
  const handleClick = (e) => {
    e.preventDefault();
    window.open(`/${name}`, "_blank");
  };
  return (
    <div className={`${className} `} onClick={handleClick}>
      <div className="mxa brand wsn fcc g5 aic fwn wfc cp hover:underline">
        {t(label)}
        <ArrowUpRight className="w-4 h-4" />
      </div>
    </div>
  );
}
