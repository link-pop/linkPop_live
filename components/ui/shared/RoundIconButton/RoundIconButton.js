"use client";

import Link from "next/link";

export default function RoundIconButton({
  children,
  onClick,
  href,
  title,
  className = "",
  extraClasses = "",
  linkProps = {},
  as = "div",
}) {
  const baseClasses = `bw1 border-[var(--color-brand)] br50 h44 w44 cp fcc ${extraClasses}`;
  const combinedClasses = `${baseClasses} ${className}`;

  // When a href is provided, render a Link
  if (href) {
    return (
      <Link
        href={href}
        className={combinedClasses}
        title={title}
        {...linkProps}
      >
        {children}
      </Link>
    );
  }

  // Otherwise render the specified element (default: div)
  const Component = as;
  return (
    <Component className={combinedClasses} onClick={onClick} title={title}>
      {children}
    </Component>
  );
}
