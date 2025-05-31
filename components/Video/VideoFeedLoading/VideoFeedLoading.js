"use client";

import { Play } from "lucide-react";
import usePageTitleHeight from "@/hooks/usePageTitleHeight";

export default function VideoFeedLoading() {
  const pageTitleHeight = usePageTitleHeight();

  // Calculate the height accounting for PageTitle
  const containerHeight =
    pageTitleHeight > 0 ? `calc(100dvh - ${pageTitleHeight}px)` : "100dvh";

  return (
    <div className="w-full bg-black fcc" style={{ height: containerHeight }}>
      <div className="fc aic g20">
        <div className="w-16 h-16 br50 bg-white/20 fcc animate-pulse">
          <Play size={32} className="text-white" />
        </div>
        <div className="text-white text-lg">Loading videos...</div>
        <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="w-full h-full bg-white/50 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
