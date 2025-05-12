"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * A reusable back button component that navigates back in history
 *
 * @param {Object} props Component props
 * @param {Function} [props.onBack] Optional custom back function, defaults to router.back()
 * @param {string} [props.className] Optional additional classes
 * @param {number} [props.size] Icon size (default: 20)
 * @returns {JSX.Element} The back button component
 */
export default function BackButton({ onBack, className = "", size = 20 }) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <ArrowLeft
      onClick={handleBack}
      className={`cursor-pointer hover:opacity-70 flex-shrink-0 ${className}`}
      size={size}
    />
  );
}
