"use client";

import React from "react";
import { escapeRegExp } from "@/lib/utils/escapeRegExp";

/**
 * A component that renders rich text (HTML) content with search query matches highlighted.
 * It uses dangerouslySetInnerHTML, so the input should be trusted or sanitized.
 * @param {{htmlContent: string, query: string, className: string}} props
 */
export default function HighlightedRichText({ htmlContent, query, className }) {
  if (!query || !htmlContent) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  const highlightedHtml = htmlContent.replace(
    regex,
    `<span class="bg-yellow-300 rounded-sm text-black">$1</span>`
  );

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
    />
  );
}
