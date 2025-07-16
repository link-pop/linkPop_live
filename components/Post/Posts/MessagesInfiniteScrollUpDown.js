import React, { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

// Shows a floating up/down arrow to scroll to top or bottom of the message list
export default function MessagesInfiniteScrollUpDown({ scrollContainerRef }) {
  const [showButton, setShowButton] = useState(false);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // If user is not at the bottom (within 100px), show down arrow
      if (scrollTop + clientHeight < scrollHeight - 100) {
        setShowButton(true);
        setAtBottom(false);
      } else if (scrollTop > 100) {
        // If user is not at the top (scrolled down more than 100px), show up arrow
        setShowButton(true);
        setAtBottom(true);
      } else {
        setShowButton(false);
      }
    };

    container.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [scrollContainerRef]);

  const handleClick = () => {
    const container = scrollContainerRef?.current;
    if (!container) return;
    if (atBottom) {
      // Scroll to top
      container.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Scroll to bottom
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  };

  if (!showButton) return null;

  return (
    <div
      className="absolute z9 right-4 bottom-54 z-20 flex items-center justify-center rounded-full bg-accent/50 border-[1px] text-foreground shadow-lg cursor-pointer w-10 h-10 transition-opacity duration-200"
      style={{ opacity: 0.9 }}
      onClick={handleClick}
      aria-label={atBottom ? "Scroll to top" : "Scroll to bottom"}
    >
      {atBottom ? <ArrowUp size={22} /> : <ArrowDown size={22} />}
    </div>
  );
}
