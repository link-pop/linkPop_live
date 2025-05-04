"use client";

import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { createContext } from "react";

const CarouselContext = createContext(null);

const useCarousel = () => {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a CarouselProvider");
  }
  return context;
};

const Carousel = forwardRef((props, ref) => {
  const {
    carouselOptions,
    orientation = "horizontal",
    dir,
    plugins,
    children,
    className,
    showThumbnails = true,
    showArrows = true,
    infinite,
    ...rest
  } = props;

  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(
    {
      ...carouselOptions,
      axis: orientation === "vertical" ? "y" : "x",
      direction: carouselOptions?.direction ?? dir,
      loop: infinite,
    },
    plugins
  );

  const [emblaThumbsRef, emblaThumbsApi] = showThumbnails
    ? useEmblaCarousel(
        {
          ...carouselOptions,
          axis: orientation === "vertical" ? "y" : "x",
          direction: carouselOptions?.direction ?? dir,
          containScroll: "keepSnaps",
          dragFree: true,
          loop: infinite,
        },
        plugins
      )
    : [null, null];

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const ScrollNext = useCallback(() => {
    if (!emblaMainApi) return;
    emblaMainApi.scrollNext();
  }, [emblaMainApi]);

  const ScrollPrev = useCallback(() => {
    if (!emblaMainApi) return;
    emblaMainApi.scrollPrev();
  }, [emblaMainApi]);

  const direction = carouselOptions?.direction ?? dir;

  const handleKeyDown = useCallback(
    (event) => {
      if (!emblaMainApi) return;
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          if (orientation === "horizontal") {
            if (direction === "rtl") {
              ScrollNext();
              return;
            }
            ScrollPrev();
          }
          break;
        case "ArrowRight":
          event.preventDefault();
          if (orientation === "horizontal") {
            if (direction === "rtl") {
              ScrollPrev();
              return;
            }
            ScrollNext();
          }
          break;
        case "ArrowUp":
          event.preventDefault();
          if (orientation === "vertical") {
            ScrollPrev();
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          if (orientation === "vertical") {
            ScrollNext();
          }
          break;
      }
    },
    [emblaMainApi, orientation, direction]
  );

  const onThumbClick = useCallback(
    (index) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi, emblaThumbsApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi) return;
    const selected = emblaMainApi.selectedScrollSnap();
    setActiveIndex(selected);

    if (showThumbnails && emblaThumbsApi) {
      emblaThumbsApi.scrollTo(selected);
    }

    setCanScrollPrev(emblaMainApi.canScrollPrev());
    setCanScrollNext(emblaMainApi.canScrollNext());
  }, [emblaMainApi, emblaThumbsApi, showThumbnails]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on("select", onSelect);
    emblaMainApi.on("reInit", onSelect);
    return () => {
      emblaMainApi.off("select", onSelect);
    };
  }, [emblaMainApi, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        emblaMainApi,
        mainRef: emblaMainRef,
        thumbsRef: emblaThumbsRef,
        scrollNext: ScrollNext,
        scrollPrev: ScrollPrev,
        canScrollNext,
        canScrollPrev,
        activeIndex,
        onThumbClick,
        handleKeyDown,
        carouselOptions,
        direction,
        showArrows,
        orientation:
          orientation ||
          (carouselOptions?.axis === "y" ? "vertical" : "horizontal"),
      }}
    >
      <div
        {...rest}
        tabIndex={0}
        ref={ref}
        onKeyDownCapture={handleKeyDown}
        className={cn(
          "grid gap-2 w-full relative focus:outline-none",
          className
        )}
        dir={direction}
        data-show-arrows={showArrows}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
});

const CarouselMainContainer = forwardRef(
  ({ className, dir, children, ...props }, ref) => {
    const { mainRef, orientation, direction } = useCarousel();

    return (
      <div {...props} ref={mainRef} className="overflow-hidden" dir={direction}>
        <div
          ref={ref}
          className={cn(
            "flex",
            orientation === "vertical" ? "flex-col" : "",
            className
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);

const CarouselThumbsContainer = forwardRef(
  ({ className, dir, children, ...props }, ref) => {
    const { thumbsRef, orientation, direction } = useCarousel();

    return (
      <div
        {...props}
        ref={thumbsRef}
        className="overflow-hidden"
        dir={direction}
      >
        <div
          ref={ref}
          className={cn(
            "flex",
            orientation === "vertical" ? "flex-col" : "",
            className
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);

const SliderMainItem = forwardRef(({ className, children, ...props }, ref) => {
  const { orientation } = useCarousel();
  return (
    <div
      {...props}
      ref={ref}
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full bg-background p-0",
        orientation === "vertical" ? "pb-0" : "pr-0",
        className
      )}
    >
      {children}
    </div>
  );
});

const SliderThumbItem = forwardRef(
  ({ className, index, children, ...props }, ref) => {
    const { activeIndex, onThumbClick, orientation } = useCarousel();
    const isSlideActive = activeIndex === index;
    return (
      <div
        {...props}
        ref={ref}
        onClick={() => onThumbClick(index)}
        className={cn(
          "flex min-w-0 shrink-0 grow-0 basis-1/3 bg-background p-1",
          orientation === "vertical" ? "pb-1" : "pr-1",
          className
        )}
      >
        <div
          className={cn(
            "relative aspect-square h-20 w-full opacity-50 rounded-md transition-opacity",
            isSlideActive && "!opacity-100"
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);

const CarouselIndicator = forwardRef(({ className, index, ...props }, ref) => {
  const { activeIndex, onThumbClick } = useCarousel();
  const isSlideActive = activeIndex === index;
  return (
    <div
      ref={ref}
      className={cn(
        "h-1 w-6 rounded-full cursor-pointer",
        "data-[active='false']:bg-primary/50 data-[active='true']:bg-primary",
        className
      )}
      data-active={isSlideActive}
      onClick={() => onThumbClick(index)}
      {...props}
    >
      <span className="sr-only">slide {index + 1}</span>
    </div>
  );
});

const CarouselPrevious = forwardRef(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const {
      canScrollNext,
      canScrollPrev,
      scrollNext,
      scrollPrev,
      orientation,
      direction,
      showArrows,
    } = useCarousel();

    if (!showArrows) return null;

    const scroll = direction === "rtl" ? scrollNext : scrollPrev;
    const canScroll = direction === "rtl" ? canScrollNext : canScrollPrev;

    return (
      <div
        ref={ref}
        className={cn(
          "absolute h-8 w-8 rounded-full cursor-pointer flex items-center justify-center",
          "bg-background/80 hover:bg-background/90",
          "border border-input hover:bg-accent hover:text-accent-foreground",
          orientation === "vertical"
            ? "-top-12 left-1/2 -translate-x-1/2 rotate-90"
            : "left-4 top-1/2 -translate-y-1/2",
          "z-30",
          !canScroll && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={canScroll ? scroll : undefined}
        {...props}
      >
        <ChevronLeftIcon className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </div>
    );
  }
);

const CarouselNext = forwardRef(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const {
      canScrollNext,
      canScrollPrev,
      scrollNext,
      scrollPrev,
      orientation,
      direction,
      showArrows,
    } = useCarousel();

    if (!showArrows) return null;

    const scroll = direction === "rtl" ? scrollPrev : scrollNext;
    const canScroll = direction === "rtl" ? canScrollPrev : canScrollNext;

    return (
      <div
        ref={ref}
        className={cn(
          "absolute h-8 w-8 rounded-full cursor-pointer flex items-center justify-center",
          "bg-background/80 hover:bg-background/90",
          "border border-input hover:bg-accent hover:text-accent-foreground",
          orientation === "vertical"
            ? "-bottom-12 left-1/2 -translate-x-1/2 rotate-90"
            : "right-4 top-1/2 -translate-y-1/2",
          "z-30",
          !canScroll && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={canScroll ? scroll : undefined}
        {...props}
      >
        <ChevronRightIcon className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </div>
    );
  }
);

// Add display names
Carousel.displayName = "Carousel";
CarouselMainContainer.displayName = "CarouselMainContainer";
CarouselThumbsContainer.displayName = "CarouselThumbsContainer";
SliderMainItem.displayName = "SliderMainItem";
SliderThumbItem.displayName = "SliderThumbItem";
CarouselIndicator.displayName = "CarouselIndicator";
CarouselPrevious.displayName = "CarouselPrevious";
CarouselNext.displayName = "CarouselNext";

export {
  Carousel,
  CarouselMainContainer,
  CarouselThumbsContainer,
  SliderMainItem,
  SliderThumbItem,
  CarouselIndicator,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
};
