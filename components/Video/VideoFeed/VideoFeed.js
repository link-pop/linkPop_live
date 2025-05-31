"use client";

import { useEffect, useRef } from "react";
import { useVideoFeed } from "../hooks/useVideoFeed";
import VideoFeedItem from "../VideoFeedItem/VideoFeedItem";
import VideoFeedLoading from "../VideoFeedLoading/VideoFeedLoading";
import VideoFeedEmpty from "../VideoFeedEmpty/VideoFeedEmpty";
import { ChevronUp, ChevronDown } from "lucide-react";
import usePageTitleHeight from "@/hooks/usePageTitleHeight";

export default function VideoFeed() {
  const {
    videos,
    currentIndex,
    loading,
    hasMore,
    videoRefs,
    globalMuted,
    setGlobalMuted,
    goToNext,
    goToPrevious,
    handleTouchStart,
    handleTouchEnd,
  } = useVideoFeed();

  const containerRef = useRef(null);
  const pageTitleHeight = usePageTitleHeight();

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious]);

  // Handle scroll navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isScrolling = false;
    let scrollTimeout;

    const handleScroll = (e) => {
      e.preventDefault();

      if (isScrolling) return;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);

      isScrolling = true;

      if (e.deltaY > 0) {
        // Scrolling down
        goToNext();
      } else {
        // Scrolling up
        goToPrevious();
      }
    };

    container.addEventListener("wheel", handleScroll, { passive: false });
    return () => container.removeEventListener("wheel", handleScroll);
  }, [goToNext, goToPrevious]);

  // Scroll to current video
  useEffect(() => {
    if (videoRefs.current[currentIndex]) {
      videoRefs.current[currentIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentIndex]);

  if (loading) {
    return <VideoFeedLoading />;
  }

  if (videos.length === 0) {
    return <VideoFeedEmpty />;
  }

  // Calculate the height accounting for PageTitle
  const containerHeight =
    pageTitleHeight > 0 ? `calc(100dvh - ${pageTitleHeight}px)` : "100dvh";

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden bg-black por"
      style={{ height: containerHeight }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navigation arrows */}
      <div className="poa r20 cy z-10 fc g10">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="w-12 h-12 br50 bg-black/50 fcc text-white hover:bg-black/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronUp size={24} />
        </button>
        <button
          onClick={goToNext}
          disabled={currentIndex === videos.length - 1 && !hasMore}
          className="w-12 h-12 br50 bg-black/50 fcc text-white hover:bg-black/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronDown size={24} />
        </button>
      </div>

      {/* Video indicator */}
      <div className="poa t20 cx z-10 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
        {currentIndex + 1} / {videos.length}
      </div>

      {/* Videos container */}
      <div className="w-full h-full">
        {videos.map((video, index) => (
          <VideoFeedItem
            key={video._id}
            video={video}
            isActive={index === currentIndex}
            globalMuted={globalMuted}
            onGlobalMuteChange={setGlobalMuted}
            ref={(el) => (videoRefs.current[index] = el)}
          />
        ))}
      </div>
    </div>
  );
}
