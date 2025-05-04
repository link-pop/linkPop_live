"use client";

import { useState, useEffect, useRef } from "react";
import { Link2 } from "lucide-react";
import Link from "next/link";
import { ADD_DIRECTLINK_ROUTE } from "@/lib/utils/constants";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function DirectLinkDemoSection() {
  const { t } = useTranslation();
  const svgContainerRef = useRef(null);

  // Animation states for the floating SVGs
  const [animationStates, setAnimationStates] = useState({
    svg1: { translateY: 0, scale: 1, rotate: 0 },
    svg2: { translateY: 0, scale: 1, rotate: 0 },
    svg3: { translateY: 0, scale: 1, rotate: 0 },
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
    purple: "0 4px 20px rgba(139, 92, 246, 0.4)",
    blue: "0 4px 20px rgba(59, 130, 246, 0.4)",
    teal: "0 4px 20px rgba(20, 184, 166, 0.4)",
  };

  // Colors for SVGs
  const colors = {
    purple: "#8B5CF6",
    blue: "#3B82F6",
    teal: "#14B8A6",
    pink: "#F75C9D",
    darkBlue: "#2563EB",
  };

  return (
    <section
      id="direct-link-demo-section"
      className="py-24 relative overflow-hidden bg-background"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Text Column (Left) */}
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              <span className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#14B8A6] text-transparent bg-clip-text animate-gradient-x">
                {t("directLinkDemoTitle").split(" ").slice(0, 2).join(" ")}
              </span>{" "}
              {t("directLinkDemoTitle").split(" ").slice(2).join(" ")}
            </h2>

            <p className="text-xl mb-6">{t("directLinkDemoDesc")}</p>

            <div className="inline-block">
              <Link href={ADD_DIRECTLINK_ROUTE}>
                <button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white py-3 px-8 rounded-full font-medium shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]">
                  {t("createDirectLinkButton")}
                </button>
              </Link>
            </div>
          </div>

          {/* SVG Figures Column (Right) */}
          <div ref={svgContainerRef} className="relative h-[500px]">
            {/* SVG 1 - Arrow Icon */}
            <div
              className="absolute shadow-xl rounded-2xl overflow-hidden bg-white p-8"
              style={{
                right: "5%",
                top: "5%",
                width: "140px",
                height: "140px",
                transform: `translateY(${animationStates.svg1.translateY}px) scale(${animationStates.svg1.scale}) rotate(${animationStates.svg1.rotate}deg)`,
                boxShadow: shadowStyles.purple,
                transition: "transform 0.3s ease-out",
                zIndex: 3,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17 7L7 17M17 7H8M17 7V16"
                  stroke={colors.purple}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke={colors.purple}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>

            {/* SVG 2 - Link Icon - replaced with Link2 from Lucide */}
            <div
              className="absolute shadow-xl rounded-2xl overflow-hidden bg-white p-8"
              style={{
                right: "30%",
                top: "25%",
                width: "160px",
                height: "160px",
                transform: `translateY(${animationStates.svg2.translateY}px) scale(${animationStates.svg2.scale}) rotate(${animationStates.svg2.rotate}deg)`,
                boxShadow: shadowStyles.blue,
                transition: "transform 0.3s ease-out",
                zIndex: 2,
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <Link2 size={80} color={colors.blue} strokeWidth={1.5} />
              </div>
            </div>

            {/* SVG 3 - Redirect Icon */}
            <div
              className="absolute shadow-xl rounded-2xl overflow-hidden bg-white p-8"
              style={{
                right: "10%",
                top: "55%",
                width: "140px",
                height: "140px",
                transform: `translateY(${animationStates.svg3.translateY}px) scale(${animationStates.svg3.scale}) rotate(${animationStates.svg3.rotate}deg)`,
                boxShadow: shadowStyles.teal,
                transition: "transform 0.3s ease-out",
                zIndex: 1,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 3h6v6"
                  stroke={colors.teal}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 14L21 3"
                  stroke={colors.teal}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"
                  stroke={colors.teal}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
