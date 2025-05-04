"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ADD_LANDINGPAGE_ROUTE } from "@/lib/utils/constants";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function LandingPageDemoSection() {
  const { t } = useTranslation();
  const imagesContainerRef = useRef(null);

  // Initialize animation states with calculated values instead of zeros
  const [animationStates, setAnimationStates] = useState(() => {
    // Calculate initial animation state based on current time
    const time = Date.now() / 1000;
    const states = {};

    [1, 2, 3].forEach((index) => {
      const offset = (index - 1) * 0.5;
      states[`image${index}`] = {
        translateY: Math.sin(time + offset) * 10,
        scale: 1 + Math.sin(time * 0.5 + offset) * 0.05,
        rotate: Math.sin(time * 0.3 + offset) * 3,
      };
    });

    return states;
  });

  // Effect for image floating animations
  useEffect(() => {
    // Use requestAnimationFrame for smoother animation
    let animationFrameId;

    const animateImages = () => {
      const time = Date.now() / 1000;
      const newStates = {};

      [1, 2, 3].forEach((index) => {
        const offset = (index - 1) * 0.5;
        newStates[`image${index}`] = {
          translateY: Math.sin(time + offset) * 10,
          scale: 1 + Math.sin(time * 0.5 + offset) * 0.05,
          rotate: Math.sin(time * 0.3 + offset) * 3,
        };
      });

      setAnimationStates(newStates);
      animationFrameId = requestAnimationFrame(animateImages);
    };

    // Start the animation loop immediately
    animationFrameId = requestAnimationFrame(animateImages);

    // Cleanup function to prevent memory leaks
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Empty dependency array ensures this runs once on mount

  // Shadow styles for consistent appearance
  const shadowStyles = {
    pink: "0 4px 20px rgba(247, 92, 157, 0.4)",
    blue: "0 4px 20px rgba(92, 124, 250, 0.4)",
    green: "0 4px 20px rgba(74, 222, 128, 0.4)",
  };

  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;

  return (
    <section
      id="landing-page-demo-section"
      className="py-16 md:py-24 relative overflow-hidden bg-background"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Images Column (Left) */}
          <div
            ref={imagesContainerRef}
            className="relative h-[450px] md:h-[600px] order-2 md:order-1"
          >
            {/* Container for images without perspective */}
            <div className="absolute w-full h-full">
              {/* First image - left */}
              <div
                className="absolute shadow-xl rounded-2xl overflow-hidden"
                style={{
                  left: isDesktop ? "5%" : "-5%",
                  top: "15%",
                  width: "150px",
                  height: "320px",
                  maxWidth: "45%",
                  maxHeight: "90%",
                  "@media (min-width: 768px)": {
                    width: "180px",
                    height: "390px",
                  },
                  transform: `
                    translateY(${animationStates.image1.translateY}px)
                    scale(${animationStates.image1.scale})
                    rotateZ(-${animationStates.image1.rotate}deg)
                  `,
                  boxShadow: shadowStyles.pink,
                  transition: "transform 0.05s linear", // Smoother animation
                  zIndex: 1,
                  transformOrigin: "center center",
                }}
              >
                <Image
                  src="/img/linkpop/LP1.png"
                  alt="Landing Page Example 1"
                  width={180}
                  height={390}
                  className="rounded-2xl"
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>

              {/* Second image - center */}
              <div
                className="absolute shadow-xl rounded-2xl overflow-hidden"
                style={{
                  left: isDesktop ? "35%" : "28%",
                  top: "5%",
                  width: "150px",
                  height: "320px",
                  maxWidth: "45%",
                  maxHeight: "90%",
                  "@media (min-width: 768px)": {
                    width: "180px",
                    height: "390px",
                  },
                  transform: `
                    translateY(${animationStates.image2.translateY}px)
                    scale(${animationStates.image2.scale})
                    rotateZ(-${animationStates.image2.rotate}deg)
                  `,
                  boxShadow: shadowStyles.blue,
                  transition: "transform 0.05s linear", // Smoother animation
                  zIndex: 2,
                  transformOrigin: "center center",
                }}
              >
                <Image
                  src="/img/linkpop/LP2.png"
                  alt="Landing Page Example 2"
                  width={180}
                  height={390}
                  className="rounded-2xl"
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>

              {/* Third image - right */}
              <div
                className="absolute shadow-xl rounded-2xl overflow-hidden"
                style={{
                  left: isDesktop ? "65%" : "60%",
                  top: "15%",
                  width: "150px",
                  height: "320px",
                  maxWidth: "45%",
                  maxHeight: "90%",
                  "@media (min-width: 768px)": {
                    width: "180px",
                    height: "390px",
                  },
                  transform: `
                    translateY(${animationStates.image3.translateY}px)
                    scale(${animationStates.image3.scale})
                    rotateZ(-${animationStates.image3.rotate}deg)
                  `,
                  boxShadow: shadowStyles.green,
                  transition: "transform 0.05s linear", // Smoother animation
                  zIndex: 1,
                  transformOrigin: "center center",
                }}
              >
                <Image
                  src="/img/linkpop/LP3.png"
                  alt="Landing Page Example 3"
                  width={180}
                  height={390}
                  className="rounded-2xl"
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Text Column (Right) */}
          <div className="order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {t("landingPageDemoTitle").split(" ").slice(0, -2).join(" ")}{" "}
              <span className="inline-block bg-gradient-to-r from-[#F75C9D] to-[#5C7CFA] text-transparent bg-clip-text animate-gradient-x">
                {t("landingPageDemoTitle").split(" ").slice(-2).join(" ")}
              </span>
            </h2>

            <p className="text-lg md:text-xl mb-6">
              {t("landingPageDemoDesc")}
            </p>

            <div className="inline-block">
              <Link href={ADD_LANDINGPAGE_ROUTE}>
                <button className="bg-[#F75C9D] hover:bg-[#e44b8c] text-white py-2 md:py-3 px-6 md:px-8 rounded-full font-medium shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]">
                  {t("createLandingPageButton")}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
          background-size: 200% 200%;
        }
      `}</style>
    </section>
  );
}
