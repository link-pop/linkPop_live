"use client";

import { forwardRef } from "react";
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
