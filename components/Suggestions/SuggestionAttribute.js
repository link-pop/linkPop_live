"use client";

export default function SuggestionAttribute({ value }) {
  if (!value) return null;

  return (
    <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded">
      {value}
    </span>
  );
}
