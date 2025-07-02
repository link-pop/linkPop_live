"use client";

import { forwardRef, useEffect } from "react";
import useHorizontalScroll from "@/hooks/useHorizontalScroll";
import { cn } from "@/lib/utils";

/**
 * A component that enables horizontal scrolling with the mouse wheel
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements to render inside the scrollable container
 * @param {string} props.className - Additional CSS classes to apply to the container
 * @param {Object} props.style - Additional inline styles to apply to the container
 * @returns {JSX.Element} Horizontally scrollable container
 */
const HorizontalScroll = forwardRef(function HorizontalScroll(
  { children, className = "", style = {}, ...props },
  ref
) {
  const scrollRef = useHorizontalScroll();

  const combinedRef = (node) => {
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
    scrollRef.current = node;
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const isTouchDevice = () => {
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      );
    };

    const isTouch = isTouchDevice();

    const fixScrolling = () => {
      if (!container) return;

      // Set explicit width for the container
      container.style.width = "100%";
      container.style.overflowX = "auto";
      container.style.overscrollBehaviorX = "contain";

      // Ensure the container can scroll horizontally
      container.style.whiteSpace = "nowrap";
      container.style.scrollbarWidth = "none";
      container.style.msOverflowStyle = "none";
    };

    fixScrolling();
    window.addEventListener("resize", fixScrolling);

    let startX, scrollLeft;
    let isMouseDown = false;

    // Mouse event handlers
    const handleMouseDown = (e) => {
      isMouseDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      container.style.cursor = "grabbing";
    };

    const handleMouseMove = (e) => {
      if (!isMouseDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
      container.style.cursor = "grab";
    };

    // Touch event handlers
    const touchStart = (e) => {
      startX = e.touches[0].pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const touchMove = (e) => {
      if (!startX) return;
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
      if (Math.abs(walk) > 10) {
        e.preventDefault();
      }
    };

    const touchEnd = () => {
      startX = null;
    };

    // Add mouse events for desktop scrolling
    if (!isTouch) {
      container.style.cursor = "grab";
      container.addEventListener("mousedown", handleMouseDown);
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseup", handleMouseUp);
      container.addEventListener("mouseleave", handleMouseUp);
    }

    // Add touch events for mobile scrolling
    if (isTouch) {
      container.addEventListener("touchstart", touchStart, { passive: false });
      container.addEventListener("touchmove", touchMove, { passive: false });
      container.addEventListener("touchend", touchEnd);
    }

    return () => {
      window.removeEventListener("resize", fixScrolling);

      if (!isTouch) {
        container.removeEventListener("mousedown", handleMouseDown);
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseup", handleMouseUp);
        container.removeEventListener("mouseleave", handleMouseUp);
      }

      if (isTouch) {
        container.removeEventListener("touchstart", touchStart);
        container.removeEventListener("touchmove", touchMove);
        container.removeEventListener("touchend", touchEnd);
      }
    };
  }, [scrollRef]);

  return (
    <div
      ref={combinedRef}
      className={cn("overflow-x-auto scrollbar-hide", className)}
      style={{
        WebkitOverflowScrolling: "touch",
        padding: "10px",
        maxWidth: "100%",
        ...style,
      }}
      {...props}
    >
      <div
        className={cn("f fwn g10 flex-nowrap")}
        style={{
          overflow: "visible",
          minWidth: "min-content",
          width: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
});

export default HorizontalScroll;
