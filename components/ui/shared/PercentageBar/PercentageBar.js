"use client";

export default function PercentageBar({
  percentage = 0,
  height = 8,
  bgColor = "bg-muted",
  barColor = "bg-[var(--color-brand)]",
  animate = true,
  minWidth = 0,
}) {
  // Ensure percentage is between 0 and 100
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));

  // Only apply minWidth when percentage is not zero
  const width =
    normalizedPercentage === 0
      ? "0%"
      : minWidth
      ? `${Math.max(minWidth, normalizedPercentage)}%`
      : `${normalizedPercentage}%`;

  return (
    <div
      className={`w-full ${bgColor} rounded-full`}
      style={{ height: `${height}px` }}
    >
      <div
        className={`h-full ${barColor} rounded-full ${
          animate ? "transition-all duration-500 ease-in-out" : ""
        }`}
        style={{ width }}
      ></div>
    </div>
  );
}
