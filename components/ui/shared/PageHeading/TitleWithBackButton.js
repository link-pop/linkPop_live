"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

/**
 * A reusable component that displays a title with a back button.
 *
 * @param {Object} props Component props
 * @param {string} props.title The title text to display
 * @param {Function} [props.onBack] Optional custom back function, defaults to router.back()
 * @param {string} [props.className] Optional additional classes
 * @param {string} [props.titleClassName] Optional additional classes for the title
 * @param {boolean} [props.hideBackButton] Whether to hide the back button (default: false)
 * @returns {JSX.Element} The title with back button component
 */
export default function TitleWithBackButton({
  title,
  onBack,
  className = "",
  titleClassName = "",
  hideBackButton = false,
}) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <h2 className={`flex items-center gap-2 ${className}`}>
      {!hideBackButton && (
        <ArrowLeft
          onClick={handleBack}
          className="cursor-pointer hover:opacity-70 flex-shrink-0"
          size={20}
        />
      )}
      <span className={titleClassName}>{title}</span>
    </h2>
  );
}
