"use client";

import React, { useRef, useState, useEffect } from "react";
import { useHandlePostsLTRScroll } from "@/components/Post/Posts/useHandlePostsLTRScroll";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function PostsLTRScrollWrap({
  children,
  scrollLTR = true,
  className = "",
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const {
    handleWheel,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    specialScrollClass,
    specialScrollStyle,
  } = useHandlePostsLTRScroll(scrollLTR);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
  };

  useEffect(() => {
    const handleResize = () => {
      // Small delay to ensure content is rendered
      setTimeout(checkScroll, 100);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check scroll when children change
  useEffect(() => {
    setTimeout(checkScroll, 100);
  }, [children]);

  const handleArrowClick = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 310;
    scrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative" onWheel={(e) => scrollLTR && e.stopPropagation()}>
      {scrollLTR && (
        <>
          <button
            onClick={() => handleArrowClick("left")}
            className={`${
              canScrollLeft ? "" : "opacity-0 cursor-default"
            } absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleArrowClick("right")}
            className={`${
              canScrollRight ? "" : "opacity-0 cursor-default"
            } absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md`}
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </>
      )}
      <div
        ref={scrollRef}
        className={`${specialScrollClass} ${className}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onScroll={checkScroll}
        style={specialScrollStyle}
      >
        {children}
      </div>
    </div>
  );
}
