"use client";

import { StickyNote, Image } from "lucide-react";

export default function PostLabelViewToggle({
  viewMode = "feeds",
  onViewModeChange = () => {},
}) {
  const handleToggle = () => {
    const newMode = viewMode === "feeds" ? "attachments" : "feeds";
    onViewModeChange(newMode);
  };

  const isFeeds = viewMode === "feeds";

  return (
    <div
      className={`hs cp`}
      onClick={handleToggle}
      title={
        isFeeds ? "Switch to images only view" : "Switch to full posts view"
      }
    >
      {isFeeds ? <Image size={24} /> : <StickyNote size={24} />}
    </div>
  );
}
