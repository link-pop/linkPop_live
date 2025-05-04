import React from "react";

export const useHandlePostsLTRScroll = (scrollLTR) => {
  const isMobile = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }, []);

  const specialScrollClass =
    scrollLTR && !isMobile
      ? "wf overflow-x-auto touch-pan-x overscroll-contain select-none isolate"
      : "wf overflow-x-auto select-none";

  const specialScrollStyle =
    scrollLTR && !isMobile
      ? {
          touchAction: "pan-x",
          overscrollBehavior: "contain",
          // scrollbarWidth: "none",
          msOverflowStyle: "none",
        }
      : undefined;

  const handleWheel = React.useCallback(
    (e) => {
      if (!scrollLTR) return;
      const container = e.currentTarget;
      const isScrollable = container.scrollWidth > container.clientWidth;

      if (!isScrollable) return;

      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY || e.deltaX;
      container.scrollLeft += delta;
    },
    [scrollLTR]
  );

  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);

  const handleMouseDown = React.useCallback(
    (e) => {
      if (!scrollLTR) return;
      setIsDragging(true);
      const container = e.currentTarget;
      setStartX(e.pageX - container.offsetLeft);
      setScrollLeft(container.scrollLeft);
    },
    [scrollLTR]
  );

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = React.useCallback(
    (e) => {
      if (!isDragging || !scrollLTR) return;
      e.preventDefault();
      const container = e.currentTarget;
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    },
    [isDragging, scrollLTR, startX, scrollLeft]
  );

  return {
    handleWheel,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    isDragging,
    specialScrollClass,
    specialScrollStyle,
  };
};
