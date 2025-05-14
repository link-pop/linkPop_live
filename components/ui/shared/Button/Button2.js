"use client";

import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";
import Link from "next/link";
import { SITE1, SITE2 } from "@/config/env";
import { useState } from "react";

// * moreThanFriend button
export default function Button2({
  href,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  text,
  children,
  className = "",
  variant = "primary",
  as,
  disabled = false,
  animation = "scale", // New prop for animation type: scale, pulse, bounce, shine
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const baseStyles = `wsn fcc ttu h44 br20 py12 px24 cp transition-colors relative overflow-hidden`;
  const variants = {
    primary: "bg-[var(--color-brand)] hover:brightness-[1.1]",
    secondary: `bg-[var(--color-brand)] ${
      SITE1 ? BRAND_INVERT_CLASS : "text-white"
    } hover:brightness-[1.1]`,
    outline: "bw1 !border-[var(--color-brand)] !brand bg-transparent",
    ghost: "bg-transparent text-gray-800 hover:bg-accent",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  // Add disabled class if disabled prop is true
  const disabledClass = disabled ? "pen opacity-50 cursor-not-allowed" : "";

  // Animation classes
  const getAnimationClasses = () => {
    if (disabled) return "";

    switch (animation) {
      case "scale":
        return isPressed
          ? "transform scale-[.97] transition-transform duration-150"
          : isHovered
          ? "transform scale-[1.03] transition-transform duration-150"
          : "transform scale-100 transition-transform duration-150";
      case "pulse":
        return isHovered ? "animate-[pulse_1.5s_ease-in-out_infinite]" : "";
      case "bounce":
        return isHovered ? "animate-[bounce_0.5s_ease-in-out_infinite]" : "";
      case "shine":
        return isHovered
          ? "after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:left-0 after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent after:animate-[shine_2s_ease-in-out_infinite]"
          : "";
      default:
        return "";
    }
  };

  const combinedClassName = `${baseStyles} ${
    variants[variant]
  } ${disabledClass} ${getAnimationClasses()} ${className}`;
  const textClassName = `fcc !fwn gap8 ${
    variant !== "outline" && variant !== "danger"
      ? SITE1
        ? BRAND_INVERT_CLASS
        : "text-white"
      : ""
  }`;

  const content = (
    <>
      {LeftIcon && <LeftIcon className="w-5 h-5" />}
      {text ||
        (children && <span className="font-medium">{text || children}</span>)}
      {RightIcon && <RightIcon className="w-5 h-5" />}
    </>
  );

  // Event handlers
  const handleMouseEnter = () => !disabled && setIsHovered(true);
  const handleMouseLeave = () => {
    !disabled && setIsHovered(false);
    !disabled && setIsPressed(false);
  };
  const handleMouseDown = () => !disabled && setIsPressed(true);
  const handleMouseUp = () => !disabled && setIsPressed(false);

  const interactionProps = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onTouchStart: handleMouseDown,
    onTouchEnd: handleMouseUp,
  };

  // For href, don't use Link if disabled
  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={combinedClassName}
        {...interactionProps}
        {...props}
      >
        <span className={textClassName}>{content}</span>
      </Link>
    );
  } else if (href && disabled) {
    // When disabled but href is provided, render a div instead
    return (
      <div className={combinedClassName} {...props}>
        <span className={textClassName}>{content}</span>
      </div>
    );
  }

  if (as === "div") {
    return (
      <div className={combinedClassName} {...interactionProps} {...props}>
        <span className={textClassName}>{content}</span>
      </div>
    );
  }

  return (
    <button
      className={combinedClassName}
      disabled={disabled}
      {...interactionProps}
      {...props}
    >
      <span className={textClassName}>{content}</span>
    </button>
  );
}

// Add CSS animation keyframes
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes shine {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10%);
      }
    }
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
  `;
  document.head.appendChild(style);
}
