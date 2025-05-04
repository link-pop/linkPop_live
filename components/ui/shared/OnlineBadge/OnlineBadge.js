"use client";

export default function OnlineBadge({ className = "" }) {
  return (
    <div 
      className={`poa br50 bg-green-500 border-2 border-white ${className}`}
      title="Online"
    />
  );
}
