"use client";

import { useState } from "react";
import { incrementSocialLinkClicks } from "@/lib/actions/incrementSocialLinkClicks";

export default function TrackableSocialMediaLink({
  href,
  children,
  className,
  title,
  linkId,
}) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = async () => {
    // Don't try to track if no linkId is provided
    if (!linkId) return;

    // Don't track multiple clicks within the same session
    if (isClicked) return;

    try {
      const result = await incrementSocialLinkClicks(linkId);
      if (result.success) {
        // Mark as clicked even if it was an owner click (to prevent multiple attempts)
        setIsClicked(true);

        // We can optionally handle owner clicks differently if needed
        if (result.ownerClick) {
          // Owner's clicks are not counted, but we still mark it as clicked
          // in the UI to prevent multiple tracking attempts
          console.log("Owner click detected - not counted in stats");
        }
      } else {
        console.error("Failed to track link click:", result.error);
      }
    } catch (error) {
      console.error("Error tracking link click:", error);
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={title}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
