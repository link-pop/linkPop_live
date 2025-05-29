"use client";

export default function TagPill({ children, className = "" }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full bg-accent text-foreground text-xs font-medium mr-2 mb-2 ${className}`}
    >
      {children}
    </span>
  );
}
