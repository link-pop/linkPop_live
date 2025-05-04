"use client";

import Image from "next/image";
import { useTheme } from "@/components/ui/shared/ThemeProvider/ThemeProvider";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function GeoFilterDemoSection() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const imagesContainerRef = useRef(null);

  const [animationStates, setAnimationStates] = useState({
    image1: { translateY: 0, scale: 1, rotate: 0 },
    image2: { translateY: 0, scale: 1, rotate: 0 },
    image3: { translateY: 0, scale: 2, rotate: 0 },
    image4: { translateY: 0, scale: 2, rotate: 0 },
  });

  useEffect(() => {
    const animateImages = () => {
      const keys = Object.keys(animationStates);
      const newStates = { ...animationStates };

      keys.forEach((key, index) => {
        const time = Date.now() / 1000;
        const offset = index * 0.5;
        newStates[key] = {
          translateY: Math.sin(time + offset) * 4,
          scale: 1 + Math.sin(time * 0.5 + offset) * 0.015,
          rotate: Math.sin(time * 0.3 + offset) * 1,
        };
      });
      setAnimationStates(newStates);
    };

    const animationInterval = setInterval(animateImages, 50);
    return () => clearInterval(animationInterval);
  }, [animationStates]);

  const shadowStyles = {
    red: "0 4px 20px rgba(239, 68, 68, 0.5)",
    green: "0 4px 20px rgba(74, 222, 128, 0.4)",
    blue: "0 4px 20px rgba(59, 130, 246, 0.4)",
  };

  return (
    <section
      id="geo-filter-section"
      className="py-16 md:py-24 md:pt-40 relative bg-background"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="md:col-span-2 text-center mb-2">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 leading-tight">
              <span className="inline-block bg-gradient-to-r from-[#4ADE80] to-[#38BDF8] text-transparent bg-clip-text animate-gradient-x">
                {t("geoFilterDemoTitle")}
              </span>
            </h2>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              {t("geoFilterDemoDesc")}
            </p>
            <p className="text-sm md:fz16 max-w-2xl mx-auto">
              {t("geoFilterAvailability")}
            </p>
          </div>

          <div
            ref={imagesContainerRef}
            className="md:col-span-2 flex flex-col md:flex-row justify-center items-center md:items-start md:justify-center gap-10 md:gap-20"
          >
            {theme === "light" ? (
              <>
                <div
                  className="shadow-xl rounded-2xl overflow-hidden w-[250px] h-[350px] md:w-[500px] md:h-[600px] relative"
                  style={{
                    transform: `translateY(${animationStates.image1.translateY}px) scale(${animationStates.image1.scale}) rotate(${animationStates.image1.rotate}deg)`,
                    boxShadow: shadowStyles.red,
                    transition: "transform 0.3s ease-out",
                  }}
                >
                  <Image
                    src="/img/linkpop/geoFilterLight.png"
                    alt="Geo Filter Light Mode"
                    fill
                    className="rounded-2xl object-contain"
                  />
                </div>

                <div
                  className="shadow-xl rounded-2xl overflow-hidden w-[250px] h-[350px] md:w-[500px] md:h-[600px] relative"
                  style={{
                    transform: `translateY(${animationStates.image3.translateY}px) scale(${animationStates.image3.scale}) rotate(${animationStates.image3.rotate}deg)`,
                    boxShadow: shadowStyles.green,
                    transition: "transform 0.3s ease-out",
                  }}
                >
                  <Image
                    src="/img/linkpop/geoFilterLight2.png"
                    alt="Geo Filter Light Mode 2"
                    fill
                    className="rounded-2xl object-contain"
                  />
                </div>
              </>
            ) : (
              <>
                <div
                  className="shadow-xl rounded-2xl overflow-hidden w-[250px] h-[350px] md:w-[500px] md:h-[600px] relative"
                  style={{
                    transform: `translateY(${animationStates.image2.translateY}px) scale(${animationStates.image2.scale}) rotate(${animationStates.image2.rotate}deg)`,
                    boxShadow: shadowStyles.red,
                    transition: "transform 0.3s ease-out",
                  }}
                >
                  <Image
                    src="/img/linkpop/geoFilterDark.png"
                    alt="Geo Filter Dark Mode"
                    fill
                    className="rounded-2xl object-contain"
                  />
                </div>

                <div
                  className="shadow-xl rounded-2xl overflow-hidden w-[250px] h-[350px] md:w-[500px] md:h-[600px] relative"
                  style={{
                    transform: `translateY(${animationStates.image4.translateY}px) scale(${animationStates.image4.scale}) rotate(${animationStates.image4.rotate}deg)`,
                    boxShadow: shadowStyles.green,
                    transition: "transform 0.3s ease-out",
                  }}
                >
                  <Image
                    src="/img/linkpop/geoFilterDark2.png"
                    alt="Geo Filter Dark Mode 2"
                    fill
                    className="rounded-2xl object-contain"
                  />
                </div>
              </>
            )}
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
