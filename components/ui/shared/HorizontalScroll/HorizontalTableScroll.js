"use client";

import React from "react";
import useHorizontalScroll from "@/hooks/useHorizontalScroll";

// ! code start HorizontalTableScroll
export default function HorizontalTableScroll({ children, className = "" }) {
  const scrollRef = useHorizontalScroll();

  return (
    <div
      ref={scrollRef}
      className={`w-full overflow-x-auto ${className}`}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {children}
    </div>
  );
}
// ? code end HorizontalTableScroll
