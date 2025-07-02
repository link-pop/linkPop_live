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
  initialTab = 0,
}) {
  const [switched, setSwitched] = useState(initialTab);
  const [prevSwitched, setPrevSwitched] = useState(initialTab);
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
      labelsRef.current[switched] &&
      indicatorRef.current &&
      tabsContainerRef.current
    ) {
      const activeTab = labelsRef.current[switched];
      const tabsContainer = tabsContainerRef.current;
      // Get the full tab's width and its offsetLeft relative to the container
      const width = activeTab.offsetWidth;
      // The left offset of the tab relative to the container
      const left =
        activeTab.getBoundingClientRect().left -
        tabsContainer.getBoundingClientRect().left;
      indicatorRef.current.style.width = `${width}px`;
      indicatorRef.current.style.left = `${left}px`;
    }
  }, [switched]);

  return (
    <div className={`fc w-full ${className}`} style={style}>
      <div className={`w-full ${labelsClassName}`}>
        <HorizontalScroll>
          <div className="flex relative w-full" ref={tabsContainerRef}>
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
                  "wsn cp py-2 px-4 text-center flex-1 min-w-fit",
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

      <div className="mt-4 relative overflow-hidden w-full">
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
