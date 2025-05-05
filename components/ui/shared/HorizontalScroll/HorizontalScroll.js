"use client";

import { forwardRef, useEffect } from "react";
import useHorizontalScroll from "@/hooks/useHorizontalScroll";

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

  // Combine the refs if an external ref is provided
  const combinedRef = (node) => {
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
    scrollRef.current = node;
  };

  // Add effect to fix right padding and touch scrolling
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Helper function to detect if device has touch capability
    const isTouchDevice = () => {
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      );
    };

    const isTouch = isTouchDevice();

    const fixScrolling = () => {
      const childContainer = container.firstElementChild;
      if (!childContainer || !childContainer.children.length) return;

      // Only apply special padding for touch devices
      if (isTouch) {
        // Ensure adequate padding to allow scrolling to the last item
        // This needs to be large enough on mobile to allow the last item to be fully visible
        const viewportWidth = window.innerWidth;
        const rightPadding = Math.max(viewportWidth / 2, 80);
        childContainer.style.paddingRight = `${rightPadding}px`;

        // Make sure the container has full width to enable scrolling to the end
        container.style.width = "100%";
        container.style.overscrollBehaviorX = "contain";
      }
    };

    fixScrolling();
    window.addEventListener("resize", fixScrolling);

    // Only apply touch event handlers for touch devices
    let startX, scrollLeft;
    let touchListenersAdded = false;

    const touchStart = (e) => {
      startX = e.touches[0].pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const touchMove = (e) => {
      if (!startX) return;
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5; // Multiply by factor for faster scrolling
      container.scrollLeft = scrollLeft - walk;

      // Prevent page scrolling when horizontally scrolling the container
      if (Math.abs(walk) > 10) {
        e.preventDefault();
      }
    };

    const touchEnd = () => {
      startX = null;
    };

    // Only add touch event listeners if this is a touch device
    if (isTouch) {
      container.addEventListener("touchstart", touchStart, { passive: false });
      container.addEventListener("touchmove", touchMove, { passive: false });
      container.addEventListener("touchend", touchEnd, { passive: false });
      touchListenersAdded = true;
    }

    return () => {
      window.removeEventListener("resize", fixScrolling);

      // Only remove event listeners if they were added
      if (touchListenersAdded) {
        container.removeEventListener("touchstart", touchStart);
        container.removeEventListener("touchmove", touchMove);
        container.removeEventListener("touchend", touchEnd);
      }
    };
  }, [scrollRef]);

  return (
    <div
      ref={combinedRef}
      className={`f fwn overflow-x-auto scrollbar-hide ${className}`}
      style={{
        WebkitOverflowScrolling: "touch",
        paddingTop: "10px",
        paddingBottom: "10px",
        ...style,
      }}
      {...props}
    >
      <div className="f fwn g10" style={{ overflow: "visible" }}>
        {children}
      </div>
    </div>
  );
});

export default HorizontalScroll;
