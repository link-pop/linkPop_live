"use client";

import { useState, useEffect, useRef } from "react";
import { Shield, Link } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function ShieldProtectionDemoSection() {
  const { t } = useTranslation();
  const svgContainerRef = useRef(null);

  // Animation states for the floating SVGs
  const [animationStates, setAnimationStates] = useState({
    svg1: { translateY: 0, scale: 1, rotate: 0 },
    svg2: { translateY: 0, scale: 1, rotate: 0 },
  });

  // Effect for SVG floating animations
  useEffect(() => {
    const animateSvgs = () => {
      const keys = Object.keys(animationStates);
      const newStates = { ...animationStates };

      keys.forEach((key, index) => {
        // Create different animation patterns for each SVG
        const time = Date.now() / 1000;
        const offset = index * 0.5; // Offset each SVG's animation

        // Gentle floating effect with different patterns
        newStates[key] = {
          translateY: Math.sin(time + offset) * 10, // Floating range
          scale: 1 + Math.sin(time * 0.5 + offset) * 0.05, // Subtle scale pulsing
          rotate: Math.sin(time * 0.3 + offset) * 3, // Gentle rotation
        };
      });

      setAnimationStates(newStates);
    };

    const animationInterval = setInterval(animateSvgs, 50);
    return () => clearInterval(animationInterval);
  }, [animationStates]);

  // Shadow styles for consistent appearance
  const shadowStyles = {
    green: "0 4px 20px rgba(20, 184, 166, 0.4)",
    blue: "0 4px 20px rgba(59, 130, 246, 0.4)",
  };

  // Colors for SVGs
  const colors = {
    teal: "#14B8A6",
    blue: "#3B82F6",
    pink: "#F75C9D",
    skyblue: "#38BDF8",
  };

  return (
    <section
      id="shield-protection-section"
      className="pb-16 md:pb-24 pt-5 relative overflow-hidden bg-background"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Text Content with Icons Above */}
        <div className="fcc grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-16 items-start">
          <div className="maw600 wf backdrop-blur-sm bg-accent/10 dark:bg-accent/5 border border-accent/10 p-4 md:p-8 rounded-2xl shadow-md">
            {/* Shield Icon - smaller and closer to text */}
            <div className="flex justify-center mb-4 md:mb-6">
              <div
                className="shadow-lg rounded-2xl overflow-hidden bg-white p-3 md:p-4"
                style={{
                  width: "80px",
                  height: "80px",
                  transform: `translateY(${animationStates.svg1.translateY}px) scale(${animationStates.svg1.scale}) rotate(${animationStates.svg1.rotate}deg)`,
                  boxShadow: shadowStyles.green,
                  transition: "transform 0.3s ease-out",
                  "@media (min-width: 768px)": {
                    width: "100px",
                    height: "100px",
                  },
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Shield size={48} color={colors.teal} />
                </div>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 leading-tight text-center">
              <span className="inline-block bg-gradient-to-r from-[#14B8A6] to-[#38BDF8] text-transparent bg-clip-text animate-gradient-x">
                {t("shieldProtectionTitle")}
              </span>
            </h2>

            <p className="text-base md:text-xl text-center">
              {t("shieldProtectionDesc")}
            </p>
          </div>

          <div className="maw600 wf backdrop-blur-sm bg-accent/10 dark:bg-accent/5 border border-accent/10 p-4 md:p-8 rounded-2xl shadow-md">
            {/* Link Icon - smaller and closer to text */}
            <div className="flex justify-center mb-4 md:mb-6">
              <div
                className="shadow-lg rounded-2xl overflow-hidden bg-white p-3 md:p-4"
                style={{
                  width: "80px",
                  height: "80px",
                  transform: `translateY(${animationStates.svg2.translateY}px) scale(${animationStates.svg2.scale}) rotate(${animationStates.svg2.rotate}deg)`,
                  boxShadow: shadowStyles.blue,
                  transition: "transform 0.3s ease-out",
                  "@media (min-width: 768px)": {
                    width: "100px",
                    height: "100px",
                  },
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Link size={48} color={colors.blue} />
                </div>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 leading-tight text-center">
              <span className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#F75C9D] text-transparent bg-clip-text animate-gradient-x">
                {t("deeplinkTechnologyTitle")}
              </span>
            </h2>

            <p className="text-base md:text-xl text-center">
              {t("deeplinkTechnologyDesc")}
            </p>
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
