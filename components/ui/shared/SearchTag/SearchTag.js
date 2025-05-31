"use client";

import { X } from "lucide-react";

/**
 * Reusable SearchTag component for displaying tags with optional remove functionality
 *
 * @param {string} text - The tag text to display
 * @param {Function} onRemove - Optional function to call when remove button is clicked
 * @param {string} variant - Tag style variant: "primary", "secondary", "accent", "muted"
 * @param {string} size - Tag size: "sm", "md", "lg"
 * @param {string} className - Additional CSS classes
 * @param {boolean} removable - Whether to show remove button (default: true if onRemove is provided)
 * @param {boolean} disabled - Whether the tag is disabled
 */
export default function SearchTag({
  text,
  onRemove,
  variant = "primary",
  size = "sm",
  className = "",
  removable = !!onRemove,
  disabled = false,
}) {
  // Variant styles
  const variantStyles = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
    muted: "bg-muted text-muted-foreground",
    gray: "bg-gray-100 text-gray-800",
  };

  // Size styles
  const sizeStyles = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  // Remove button size styles
  const removeButtonSizes = {
    sm: "w-3 h-3",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove && !disabled) {
      onRemove(text);
    }
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full transition-colors
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.sm}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {text}
      {removable && (
        <button
          onClick={handleRemove}
          disabled={disabled}
          className={`
            ml-1 rounded-full p-0.5 transition-colors
            ${
              variant === "primary"
                ? "hover:bg-primary-foreground hover:text-primary"
                : variant === "secondary"
                ? "hover:bg-secondary-foreground hover:text-secondary"
                : variant === "accent"
                ? "hover:bg-accent-foreground hover:text-accent"
                : variant === "muted"
                ? "hover:bg-muted-foreground hover:text-muted"
                : variant === "gray"
                ? "hover:bg-gray-600 hover:text-gray-100"
                : "hover:bg-primary-foreground hover:text-primary"
            }
            ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <X className={removeButtonSizes[size] || removeButtonSizes.sm} />
        </button>
      )}
    </span>
  );
}
