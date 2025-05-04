"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import WaveReveal from "@/components/animata/text/wave-reveal";

const List = ({ item, className, index, activeItem, ...props }) => {
  return (
    <div
      className={cn(
        "relative flex h-full w-20 min-w-10 cursor-pointer overflow-hidden rounded-none transition-all delay-0 duration-500 ease-in-out",
        {
          "flex-grow": index === activeItem,
        },
        className
      )}
      {...props}
    >
      {item.component ? (
        index === activeItem ? (
          <div className="h-full w-full">{item.component}</div>
        ) : item.shrink ? (
          <div className="h-full w-full">{item.shrink}</div>
        ) : (
          <div className="h-full w-full bg-gray-200 opacity-50" />
        )
      ) : (
        <>
          <img
            src={item.image}
            alt={item.title}
            className={cn("h-full w-full object-cover", {
              "blur-[2px]": index !== activeItem,
            })}
          />
          {index === activeItem && (
            <div className="absolute bottom-4 left-4 min-w-fit text-white md:bottom-8 md:left-8">
              <WaveReveal
                duration="1500ms"
                className="items-start justify-start text-xl sm:text-2xl md:text-6xl"
                text={item.title}
                direction="up"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

const items = [
  {
    image:
      "https://images.unsplash.com/photo-1541753236788-b0ac1fc5009d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3",
    title: "Mountains",
  },
  {
    image:
      "https://images.unsplash.com/photo-1718027808460-7069cf0ca9ae?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3",
    title: "Great Wall of China",
  },
  {
    image:
      "https://images.unsplash.com/photo-1584968173934-bc0b588eb806?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3",
    title: "Texture & Patterns",
  },
];

export default function ExpandableSlider({
  list = items,
  autoPlay = true,
  className,
  ...props
}) {
  const [activeItem, setActiveItem] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const intervalRef = useRef(null);

  const startAutoPlayInterval = () => {
    if (!autoPlay) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (!isHovering) {
        setActiveItem((prev) => (prev + 1) % list.length);
      }
    }, 5000);
  };

  const updateActiveItem = (newIndex) => {
    setActiveItem(newIndex);
    startAutoPlayInterval();
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
    setTouchEnd(null);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      updateActiveItem((activeItem + 1) % list.length);
    } else if (isRightSwipe) {
      updateActiveItem((activeItem - 1 + list.length) % list.length);
    }
  };

  useEffect(() => {
    startAutoPlayInterval();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoPlay, list.length, isHovering]);

  return (
    <div
      {...props}
      className={cn("flex w-full flex-col gap-1", className)}
    >
      <div className="flex h-full gap-1">
        {list.map((item, index) => (
          <List
            key={item.title || index}
            item={item}
            index={index}
            activeItem={activeItem}
            onMouseEnter={() => {
              updateActiveItem(index);
              setIsHovering(true);
            }}
            onMouseLeave={() => {
              setIsHovering(false);
            }}
            className="md:block hidden"
          />
        ))}
        {/* Mobile slider container with overflow hidden for clean edges */}
        <div className="md:hidden w-full h-full relative overflow-hidden">
          {/* Sliding wrapper with transform animation */}
          <div
            className="flex transition-transform duration-300 ease-in-out h-full"
            style={{ transform: `translateX(-${activeItem * 100}%)` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Individual slide containers */}
            {list.map((item, index) => (
              <div key={index} className="w-full h-full flex-shrink-0">
                <List
                  item={item}
                  index={index}
                  activeItem={index}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Navigation dots for mobile view */}
      <div className="flex justify-center gap-3 mt-4 md:hidden">
        {list.map((_, index) => (
          <button
            key={index}
            onClick={() => updateActiveItem(index)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              index === activeItem
                ? "bg-black/90 scale-125"
                : "bg-black/20 hover:bg-black/40"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
