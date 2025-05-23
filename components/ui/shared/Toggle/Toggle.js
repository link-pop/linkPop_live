"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import HorizontalScroll from "@/components/ui/shared/HorizontalScroll/HorizontalScroll";

export default function Toggle({
  labels = [
    { text: "label1", className: "" },
    { text: "label2", className: "" },
  ],
  contents = [null, null],
  className = "",
  labelsClassName = "",
  style,
}) {
  const [switched, setSwitched] = useState(0);
  const [prevSwitched, setPrevSwitched] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { t } = useTranslation();
  const tabsContainerRef = useRef(null);
  const labelsRef = useRef([]);
  const labelsTextRef = useRef([]);
  const indicatorRef = useRef(null);

  // Handle tab switching with animation
  const handleTabSwitch = (index) => {
    if (index === switched || isTransitioning) return;

    setPrevSwitched(switched);
    setSwitched(index);
    setIsTransitioning(true);

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300); // Match this with your CSS transition duration
  };

  // Position the indicator
  useEffect(() => {
    if (
      labelsTextRef.current[switched] &&
      indicatorRef.current &&
      tabsContainerRef.current
    ) {
      const activeText = labelsTextRef.current[switched];
      const tabsContainer = tabsContainerRef.current;
      // Get the span's width and its offsetLeft relative to the container
      const width = activeText.offsetWidth;
      // The left offset of the span relative to the container
      const left =
        activeText.getBoundingClientRect().left -
        tabsContainer.getBoundingClientRect().left;
      indicatorRef.current.style.width = `${width}px`;
      indicatorRef.current.style.left = `${left}px`;
    }
  }, [switched]);

  return (
    <div className={`fc ${className}`} style={style}>
      <div className={`wf ${labelsClassName}`}>
        <HorizontalScroll className="w-full">
          <div
            className="flex relative"
            ref={tabsContainerRef}
            style={{ minWidth: "100%" }}
          >
            {/* Animated indicator - slides between tabs */}
            <div
              ref={indicatorRef}
              className="absolute bottom-0 h-[2px] bg-[var(--color-brand)] transition-all duration-300 ease-in-out"
            />

            {labels.map((label, index) => (
              <div
                key={index}
                ref={(el) => (labelsRef.current[index] = el)}
                onClick={() => handleTabSwitch(index)}
                className={cn(
                  "cp py-2 px-4 text-center whitespace-nowrap min-w-fit mx-1",
                  switched === index
                    ? "brand font-medium"
                    : "text-foreground hover:bg-accent",
                  "transition-colors duration-300",
                  label.className
                )}
                title={t(label.text)}
              >
                <span
                  ref={(el) => (labelsTextRef.current[index] = el)}
                  className="inline-block"
                >
                  {t(label.text)}
                </span>
              </div>
            ))}
          </div>
        </HorizontalScroll>
      </div>

      <div className="mt-4 relative overflow-hidden">
        {/* Content transition container */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            isTransitioning ? "opacity-0" : "opacity-100"
          )}
        >
          {contents[switched]}
        </div>
      </div>
    </div>
  );
}
