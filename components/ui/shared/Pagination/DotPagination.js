"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DotPagination({
  currentPage,
  totalPages,
  setCurrentPage,
  goNextPage,
  goPrevPage,
  className = "",
}) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Left arrow */}
      <div
        onClick={goPrevPage}
        className="cursor-pointer text-foreground/60 hover:text-foreground"
      >
        <ChevronLeft size={20} />
      </div>

      {/* Dots */}
      <div className="flex gap-1">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full ${
              idx === currentPage ? "bg-foreground" : "bg-foreground/30"
            }`}
            onClick={() => setCurrentPage(idx)}
          />
        ))}
      </div>

      {/* Right arrow */}
      <div
        onClick={goNextPage}
        className="cursor-pointer text-foreground/60 hover:text-foreground"
      >
        <ChevronRight size={20} />
      </div>
    </div>
  );
}
