import React from "react";
import { escapeRegExp } from "./escapeRegExp";

/**
 * Highlights matches in a text string.
 * @param {string} text The text to search within.
 * @param {string} query The search query.
 * @returns {JSX.Element} A React fragment with highlighted text.
 */
export function HighlightMatches({ text, query }) {
  if (!query || !text) {
    return text;
  }

  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-300 rounded-sm">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}
