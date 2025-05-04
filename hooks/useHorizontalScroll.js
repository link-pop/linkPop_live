"use client";

import { useEffect, useRef } from "react";

/**
 * Hook to enable horizontal scrolling with the mouse wheel
 * @returns {React.RefObject} Reference to attach to the scrollable container
 */
export default function useHorizontalScroll() {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    
    if (!scrollContainer) return;
    
    const handleWheel = (e) => {
      // Only prevent default if we're scrolling horizontally
      if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
      }
    };
    
    // Add the event listener
    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });
    
    // Clean up the event listener
    return () => {
      scrollContainer.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return scrollRef;
}
