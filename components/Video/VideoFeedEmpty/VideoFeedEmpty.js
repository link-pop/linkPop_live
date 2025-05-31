"use client";

import { Video, Upload } from "lucide-react";
import Link from "next/link";
import usePageTitleHeight from "@/hooks/usePageTitleHeight";

export default function VideoFeedEmpty() {
  const pageTitleHeight = usePageTitleHeight();

  // Calculate the height accounting for PageTitle
  const containerHeight =
    pageTitleHeight > 0 ? `calc(100dvh - ${pageTitleHeight}px)` : "100dvh";

  return (
    <div className="w-full bg-black fcc" style={{ height: containerHeight }}>
      <div className="fc aic g20 text-center px-8">
        <div className="w-24 h-24 br50 bg-white/10 fcc">
          <Video size={48} className="text-white/60" />
        </div>

        <div className="fc aic g10">
          <h2 className="text-white text-2xl font-semibold">No videos yet</h2>
          <p className="text-white/60 text-center max-w-md">
            Be the first to share a video! Upload your content and start
            building your audience.
          </p>
        </div>

        <Link
          href="/feeds"
          className="f aic g10 bg-white text-black px-6 py-3 rounded-full hover:bg-white/90 transition-colors"
        >
          <Upload size={20} />
          <span className="font-medium">Upload Video</span>
        </Link>
      </div>
    </div>
  );
}
