"use client";

import VideoPlayer from "@/components/ui/shared/VideoPlayer/VideoPlayer";
import WaveDivider from "@/components/ui/shared/WaveDivider/WaveDivider";
import { MOBILE } from "@/lib/utils/constants";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Function to generate a random position with collision check
  const generatePosition = (existingPositions) => {
    const shapeSizes = [];
    [0, 1, 3, 5, 6, 9, 11, 12].forEach(() => {
      // Generate random size for desktop (between 160 and 240)
      const desktopSize = Math.floor(160 + Math.random() * 81);
      shapeSizes.push(desktopSize);

      const shapeSize = isMobile ? 40 : desktopSize;
      const minSpacing = 200; // Minimum spacing in pixels
      const containerSize = 1000;

      // Convert sizes to percentages
      const shapeSizePercent = (shapeSize / containerSize) * 100;
      const minSpacingPercent = (minSpacing / containerSize) * 100;

      let attempts = 0;
      let position;

      do {
        position = {
          left: Math.random() * (100 - shapeSizePercent),
          top: Math.random() * (100 - shapeSizePercent),
          size: desktopSize,
        };

        // Check if this position collides with any existing shape
        const hasCollision = existingPositions.some((existing) => {
          const xDist = Math.abs(existing.left - position.left);
          const yDist = Math.abs(existing.top - position.top);

          // Convert distances to pixels for comparison
          const xDistPixels = (xDist / 100) * containerSize;
          const yDistPixels = (yDist / 100) * containerSize;

          // Calculate total distance using Pythagorean theorem
          const totalDistance = Math.sqrt(
            xDistPixels * xDistPixels + yDistPixels * yDistPixels
          );

          return totalDistance < minSpacing;
        });

        if (!hasCollision) {
          existingPositions.push(position);
          break;
        }

        attempts++;
      } while (attempts < 100); // Increased attempts since spacing is larger

      if (attempts >= 100) {
        existingPositions.push(position);
      }
    });

    return existingPositions;
  };

  // Generate all positions first
  const positions = generatePosition([]);

  return (
    <div
      ref={ref}
      className="oh por fc aic bg-blue-500 py125 relative w-full"
      id="howItWorks"
    >
      <WaveDivider position="top" flip={true} />

      {[0, 1, 3, 5, 6, 9, 11, 12].map((index, i) => {
        const randomOpacity = 0.3 + Math.random() * 0.4;

        return (
          <motion.img
            className="!opacity-20"
            key={index}
            ref={ref}
            src={`/img/shape${index}.svg`}
            initial={{
              opacity: 0,
              y: 0,
              rotate: 0,
            }}
            animate={
              isInView
                ? {
                    opacity: randomOpacity,
                    y: [-15, 15, -15],
                    rotate: 360,
                  }
                : {
                    opacity: 0,
                    y: 0,
                    rotate: 0,
                  }
            }
            transition={{
              opacity: { duration: 0.5 },
              y: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              },
              rotate: {
                duration: 100,
                repeat: Infinity,
                ease: "linear",
              },
            }}
            style={{
              position: "absolute",
              left: `${positions[i].left}%`,
              top: `${positions[i].top}%`,
              zIndex: 0,
              width: isMobile ? "40px" : `${positions[i].size}px`,
            }}
          />
        );
      })}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={
          isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }
        }
        transition={{ duration: 0.8 }}
        className="w-full max-w-[900px] px-4 md:px-6"
      >
        <div className="aspect-video w-full">
          <VideoPlayer
            url="https://www.youtube.com/watch?v=v7pUOcjkoOU"
            className="w-full h-full"
          />
        </div>
      </motion.div>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt30 mb20 tac fz40 sm:fz60 ttu white"
      >
        IT works. Everytime.
      </motion.div>
      <WaveDivider position="bottom" />
    </div>
  );
}
