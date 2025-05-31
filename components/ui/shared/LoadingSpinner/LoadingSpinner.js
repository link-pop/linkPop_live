import React from "react";

/**
 * Reusable loading spinner component
 *
 * @param {string} size - Size of the spinner: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} className - Additional CSS classes
 * @param {string} text - Optional text to display below spinner
 * @returns {JSX.Element}
 */
export default function LoadingSpinner({
  size = "md",
  className = "",
  text = "",
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 border-[var(--color-brand)] ${sizeClasses[size]}`}
      />
      {text && <p className="text-foreground/60 text-sm mt-2">{text}</p>}
    </div>
  );
}
