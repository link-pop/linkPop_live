import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";
import Link from "next/link";
import { SITE1, SITE2 } from "@/config/env";

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
  ...props
}) {
  const baseStyles = `wsn fcc ttu h44 br20 py12 px24 cp transition-colors`;
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

  const combinedClassName = `${baseStyles} ${variants[variant]} ${disabledClass} ${className}`;
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

  // For href, don't use Link if disabled
  if (href && !disabled) {
    return (
      <Link href={href} className={combinedClassName} {...props}>
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
      <div className={combinedClassName} {...props}>
        <span className={textClassName}>{content}</span>
      </div>
    );
  }

  return (
    <button className={combinedClassName} disabled={disabled} {...props}>
      <span className={textClassName}>{content}</span>
    </button>
  );
}
