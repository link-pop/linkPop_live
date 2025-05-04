"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { useState, useEffect, useRef } from "react";

export default function HeroSection({ mongoUser }) {
  const { t, currentLang } = useTranslation();
  const sectionRef = useRef(null);
  const tagsContainerRef = useRef(null);
  const [isClientReady, setIsClientReady] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  // Ref to throttle animation updates
  const frameCountRef = useRef(0);

  // Store original positions of tags
  const [originalPositions, setOriginalPositions] = useState({
    landingPages: { left: "5%", top: "15%", right: null },
    directLinks: { left: null, top: "20%", right: "5%" },
    geoFilter: { left: "15%", top: "45%", right: null },
    analytics: { left: null, top: "70%", right: "20%" },
    shieldProtection: { left: "20%", top: "75%", right: null },
    freeTrialTag: { left: null, top: "45%", right: "5%" },
    faqTag: { left: "45%", top: "30%", right: null },
  });

  // Track tag elements for proper animation
  const tagRefs = {
    landingPages: useRef(null),
    directLinks: useRef(null),
    geoFilter: useRef(null),
    analytics: useRef(null),
    shieldProtection: useRef(null),
    freeTrialTag: useRef(null),
    faqTag: useRef(null),
  };

  // Animation states for the floating buttons
  const [animationStates, setAnimationStates] = useState({
    landingPages: { translateY: 0, scale: 1 },
    directLinks: { translateY: 0, scale: 1 },
    geoFilter: { translateY: 0, scale: 1 },
    analytics: { translateY: 0, scale: 1 },
    shieldProtection: { translateY: 0, scale: 1 },
    freeTrialTag: { translateY: 0, scale: 1 },
    faqTag: { translateY: 0, scale: 1 },
  });

  // Track if tags are fixed to the top
  const [tagsFixed, setTagsFixed] = useState(false);

  // Track if we're currently animating between states
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Store tag positions for smooth animations
  const [tagPositions, setTagPositions] = useState({
    landingPages: { fromX: 0, fromY: 0, toX: 0, toY: 0 },
    directLinks: { fromX: 0, fromY: 0, toX: 0, toY: 0 },
    geoFilter: { fromX: 0, fromY: 0, toX: 0, toY: 0 },
    analytics: { fromX: 0, fromY: 0, toX: 0, toY: 0 },
    shieldProtection: { fromX: 0, fromY: 0, toX: 0, toY: 0 },
    freeTrialTag: { fromX: 0, fromY: 0, toX: 0, toY: 0 },
    faqTag: { fromX: 0, fromY: 0, toX: 0, toY: 0 },
  });

  // Track scroll position to calculate transitions
  const [scrollY, setScrollY] = useState(0);

  // Colors with better contrast for text readability
  const colors = {
    landingPink: "#F75C9D", // Pink with white text
    directBlue: "#5C7CFA", // Blue with white text
    geoGreen: "#4ADE80", // Green with dark text
    analyticsBlue: "#519AE8", // Brighter blue with white text
    shieldGreen: "#00A67E", // Darker green with white text
    freeTrialPink: "#FF4D94", // Brighter pink with white text
    friendlyYellow: "#FFD166", // Yellow with dark text
    darkText: "#1E1E20", // Dark text color
    whiteText: "#FFFFFF", // White text color
  };

  // Animation effect for floating
  useEffect(() => {
    // Defer non-critical state until after first paint
    let idleClientReady;
    let idleWindowWidth;
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleClientReady = window.requestIdleCallback(() =>
        setIsClientReady(true)
      );
      idleWindowWidth = window.requestIdleCallback(() =>
        setWindowWidth(window.innerWidth)
      );
    } else {
      idleClientReady = setTimeout(() => setIsClientReady(true), 0);
      idleWindowWidth = setTimeout(() => setWindowWidth(window.innerWidth), 0);
    }

    let animationFrameId;
    let started = false;
    // Throttle animation updates for performance (update every 2 frames)
    const animateButtons = () => {
      if (tagsFixed || isTransitioning) return;
      frameCountRef.current = (frameCountRef.current || 0) + 1;
      if (frameCountRef.current % 2 !== 0) return; // Skip every other frame
      const keys = Object.keys(animationStates);
      const newStates = { ...animationStates };
      let changed = false;
      keys.forEach((key, index) => {
        const time = Date.now() / 2000;
        const offset = index * 0.7;
        const translateY = Math.sin(time + offset) * 4;
        const scale = 1 + Math.sin(time * 0.2 + offset) * 0.015;
        if (
          newStates[key].translateY !== translateY ||
          newStates[key].scale !== scale
        ) {
          changed = true;
          newStates[key] = { translateY, scale };
        }
      });
      if (changed) setAnimationStates(newStates);
    };

    const animateFrame = () => {
      animateButtons();
      animationFrameId = requestAnimationFrame(animateFrame);
    };

    const startAnimation = () => {
      if (!started) {
        started = true;
        animationFrameId = requestAnimationFrame(animateFrame);
      }
    };
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(startAnimation);
    } else {
      setTimeout(startAnimation, 80);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (
        typeof window !== "undefined" &&
        "cancelIdleCallback" in window &&
        idleClientReady
      ) {
        window.cancelIdleCallback(idleClientReady);
      } else if (idleClientReady) {
        clearTimeout(idleClientReady);
      }
      if (
        typeof window !== "undefined" &&
        "cancelIdleCallback" in window &&
        idleWindowWidth
      ) {
        window.cancelIdleCallback(idleWindowWidth);
      } else if (idleWindowWidth) {
        clearTimeout(idleWindowWidth);
      }
    };
  }, [tagsFixed, isTransitioning]); // Only re-run if animation should stop/start

  // Function to capture starting positions for animations
  const captureTagPositions = () => {
    const windowWidth = window.innerWidth;
    const positions = {};

    Object.keys(tagRefs).forEach((key) => {
      const element = tagRefs[key].current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const index = Object.keys(tagRefs).indexOf(key);

      // Calculate final position exactly as positioned in the fixed state
      const finalRightOffset = 70;
      const finalX = windowWidth - finalRightOffset - element.offsetWidth / 2;
      const finalTopOffset = 40 + index * 60;
      const finalY = finalTopOffset + element.offsetHeight / 2;

      positions[key] = {
        fromX: rect.left + rect.width / 2,
        fromY: rect.top + rect.height / 2,
        toX: finalX,
        toY: finalY,
      };
    });

    return positions;
  };

  // Handle scroll to check if tags should be fixed and animate transitions
  useEffect(() => {
    // Skip all effects if client is not ready
    if (!isClientReady) return;

    // Use throttled scroll handler for better performance
    let ticking = false;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrollY(scrollPosition);

      // Skip all animations and fixed tags if window width is below 1850px
      if (window.innerWidth < 1850) {
        return;
      }

      if (sectionRef.current) {
        const sectionRect = sectionRef.current.getBoundingClientRect();
        const sectionTop = sectionRect.top;

        // Detect transition from normal to fixed state
        if (sectionTop < 0 && !tagsFixed && !isTransitioning) {
          setIsTransitioning(true);

          // Capture positions for animation
          const positions = captureTagPositions();
          setTagPositions(positions);

          // After capturing positions, set to fixed
          requestAnimationFrame(() => {
            setTagsFixed(true);
            setTimeout(() => {
              setIsTransitioning(false);
            }, 1200); // Increased transition time for smoother experience
          });
        }

        // Detect transition from fixed to normal state
        if (sectionTop >= 0 && tagsFixed && !isTransitioning) {
          setIsTransitioning(true);

          // After preparing for transition, set to unfixed
          requestAnimationFrame(() => {
            setTagsFixed(false);
            setTimeout(() => {
              setIsTransitioning(false);
            }, 1200); // Increased transition time for smoother experience
          });
        }
      }

      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    const onScroll = () => {
      requestTick();
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // Call once on mount to initialize
    handleScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [tagsFixed, isTransitioning, isClientReady]); // Added isClientReady dependency

  // Scroll to section handlers
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Generate the animation styles for transitions
  const getTransitionStyles = (tagKey) => {
    if (!isTransitioning) return {};

    const positions = tagPositions[tagKey];
    if (!positions) return {};

    const index = Object.keys(tagRefs).indexOf(tagKey);
    const delay = index * 0.12; // Increased delay for smoother staggered effect

    // Calculate final position (where the fixed tags will be)
    const finalX = window.innerWidth - 70;
    const finalY = 40 + index * 60;

    if (tagsFixed) {
      // Transitioning from normal to fixed
      return {
        position: "fixed",
        top: 0,
        left: 0,
        transform: `translate(${positions.fromX}px, ${positions.fromY}px)`,
        transition: "none",
        animation: `flyToSide 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`,
        zIndex: 40 - index,
        willChange: "transform",
        backfaceVisibility: "hidden",
        transformStyle: "preserve-3d",
        "--from-x": `${positions.fromX}px`,
        "--from-y": `${positions.fromY}px`,
        "--to-x": `${finalX}px`,
        "--to-y": `${finalY}px`,
      };
    } else {
      // Transitioning from fixed to normal
      return {
        position: "fixed",
        top: 0,
        left: 0,
        transform: `translate(${finalX}px, ${finalY}px)`,
        transition: "none",
        animation: `flyToOriginal 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`,
        zIndex: 40 - index,
        willChange: "transform",
        backfaceVisibility: "hidden",
        transformStyle: "preserve-3d",
        opacity: 1, // Start fully visible
        "--from-x": `${positions.fromX}px`,
        "--from-y": `${positions.fromY}px`,
        "--to-x": `${finalX}px`,
        "--to-y": `${finalY}px`,
      };
    }
  };

  // Tag styles for consistent appearance
  const styles = {
    tag: "absolute shadow-lg rounded-full px-5 py-3 font-medium cursor-pointer transition-all duration-300 hover:shadow-xl",
  };

  // Add event listener for window resize
  useEffect(() => {
    // Add a window resize event listener to check viewport width
    const handleResize = () => {
      // Only run if the client is ready
      if (!isClientReady) return;

      // Update windowWidth state
      setWindowWidth(window.innerWidth);

      // We can check the window width and set a class on a container element
      if (document.documentElement) {
        if (window.innerWidth < 1850) {
          document.documentElement.classList.add("narrow-viewport");
          const fixedTagsElement = document.querySelector(".fixed-tags");
          if (fixedTagsElement) {
            fixedTagsElement.style.display = "none";
          }
        } else {
          document.documentElement.classList.remove("narrow-viewport");
          const fixedTagsElement = document.querySelector(".fixed-tags");
          if (fixedTagsElement) {
            fixedTagsElement.style.display = "";
          }
        }
      }
    };

    // Call once to set initial state
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isClientReady]); // Added isClientReady dependency

  // Function to render tag button
  const renderTagButton = (key, style = {}) => {
    let bgColor, textColor, label, leftPos, rightPos, topPos, onClick;

    switch (key) {
      case "landingPages":
        bgColor = colors.landingPink;
        textColor = "white";
        label = t("landingPagesButton");
        leftPos = originalPositions.landingPages.left;
        topPos = originalPositions.landingPages.top;
        onClick = () => scrollToSection("landing-page-demo-section");
        break;
      case "directLinks":
        bgColor = colors.directBlue;
        textColor = "white";
        label = t("directLinksButton");
        rightPos = originalPositions.directLinks.right;
        topPos = originalPositions.directLinks.top;
        onClick = () => scrollToSection("direct-link-demo-section");
        break;
      case "geoFilter":
        bgColor = colors.geoGreen;
        textColor = "black";
        label = t("geoFilterButton");
        leftPos = originalPositions.geoFilter.left;
        topPos = originalPositions.geoFilter.top;
        onClick = () => scrollToSection("geo-filter-section");
        break;
      case "analytics":
        bgColor = colors.analyticsBlue;
        textColor = "white";
        label = t("analyticsButton");
        rightPos = originalPositions.analytics.right;
        topPos = originalPositions.analytics.top;
        onClick = () => scrollToSection("analytics-section");
        break;
      case "shieldProtection":
        bgColor = colors.shieldGreen;
        textColor = "white";
        label = t("shieldProtectionButton");
        leftPos = originalPositions.shieldProtection.left;
        topPos = originalPositions.shieldProtection.top;
        onClick = () => scrollToSection("shield-protection-section");
        break;
      case "freeTrialTag":
        bgColor = colors.freeTrialPink;
        textColor = "white";
        label = t("freeTrialButton");
        rightPos = originalPositions.freeTrialTag.right;
        topPos = originalPositions.freeTrialTag.top;
        onClick = () => scrollToSection("pricing-section");
        break;
      case "faqTag":
        bgColor = colors.friendlyYellow;
        textColor = "black";
        label = t("beginnerFriendlyButton");
        leftPos = originalPositions.faqTag.left;
        topPos = originalPositions.faqTag.top;
        onClick = () => scrollToSection("faq-section");
        break;
    }

    const buttonStyles = {
      backgroundColor: bgColor,
      left: leftPos || "auto",
      right: rightPos || "auto",
      top: topPos,
      boxShadow: `0 4px 14px rgba(0, 0, 0, 0.3)`,
      zIndex: 40 - Object.keys(tagRefs).indexOf(key),
      opacity: 1,
      ...style,
    };

    return (
      <div
        ref={tagRefs[key]}
        className={`${styles.tag} text-${textColor} animate-tag`}
        style={buttonStyles}
        onClick={onClick}
      >
        {label}
      </div>
    );
  };

  return (
    <>
      <style jsx global>{`
        @keyframes flyToSide {
          0% {
            transform: translate(var(--from-x), var(--from-y));
            opacity: 1;
          }
          100% {
            transform: translate(var(--to-x), var(--to-y));
            opacity: 1;
          }
        }

        @keyframes flyToOriginal {
          0% {
            transform: translate(var(--to-x), var(--to-y));
            opacity: 1;
          }
          100% {
            transform: translate(var(--from-x), var(--from-y));
            opacity: 1;
          }
        }

        /* Add better animation performance */
        .animate-tag {
          will-change: transform, opacity;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          perspective: 1000px;
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.6s ease;
        }

        /* Style for small screen tags */
        @media (max-width: 1850px) {
          .small-screen-tags {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
          }

          .small-screen-tags > div {
            position: static !important;
            margin: 5px;
            transform: none !important;
          }
        }

        /* Narrow viewport styles */
        .narrow-viewport .fixed-tags > div {
          opacity: 0.2;
          transition: opacity 0.3s ease;
        }

        .narrow-viewport .fixed-tags > div:hover {
          opacity: 1;
        }
      `}</style>

      <section ref={sectionRef} className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="sm:ml30">
              <h1
                className={`${
                  currentLang !== "en"
                    ? "text-4xl md:text-5xl"
                    : "text-4xl md:text-5xl"
                } font-bold mb-6 leading-tight`}
              >
                <span className="inline-block bg-gradient-to-r from-[#F75C9D] to-[#5C7CFA] text-transparent bg-clip-text animate-gradient-x">
                  {t("landingPageHeroTitle").split(" ")[0]}
                </span>{" "}
                {t("landingPageHeroTitle").split(" ").slice(1).join(" ")}
              </h1>
              <p className="text-xl mb-10 max-w-md">
                {t("landingPageHeroDesc")}
              </p>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">
                  {t("landingPageFeaturesTitle")}
                </h2>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="mr-2 text-pink-500">•</div>
                    <span>{t("landingPageFeature1")}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 text-pink-500">•</div>
                    <span>{t("landingPageFeature2")}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 text-pink-500">•</div>
                    <span>{t("landingPageFeature3")}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 text-pink-500">•</div>
                    <span>{t("landingPageFeature4")}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 text-pink-500">•</div>
                    <span>{t("landingPageFeature5")}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 text-pink-500">•</div>
                    <span>{t("landingPageFeature6")}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div ref={tagsContainerRef} className="relative h-[500px]">
              {/* For small screens - static tags without animations */}
              {isClientReady && windowWidth < 1850 && (
                <div className="small-screen-tags">
                  {Object.keys(tagRefs).map((key) =>
                    renderTagButton(key, { position: "static", margin: "5px" })
                  )}
                </div>
              )}

              {/* Floating tag buttons with animations - only shown when in original position */}
              {isClientReady &&
                !tagsFixed &&
                !isTransitioning &&
                windowWidth >= 1850 && (
                  <>
                    <div
                      ref={tagRefs.landingPages}
                      className={`${styles.tag} text-white animate-tag`}
                      style={{
                        backgroundColor: colors.landingPink,
                        left: originalPositions.landingPages.left,
                        top: originalPositions.landingPages.top,
                        transform: `translateY(${animationStates.landingPages.translateY}px) scale(${animationStates.landingPages.scale})`,
                        boxShadow: "0 4px 14px rgba(247, 92, 157, 0.4)",
                        zIndex: 40,
                        opacity: 1,
                      }}
                      onClick={() =>
                        scrollToSection("landing-page-demo-section")
                      }
                    >
                      {t("landingPagesButton")}
                    </div>

                    <div
                      ref={tagRefs.directLinks}
                      className={`${styles.tag} text-white animate-tag`}
                      style={{
                        backgroundColor: colors.directBlue,
                        right: originalPositions.directLinks.right,
                        top: originalPositions.directLinks.top,
                        transform: `translateY(${animationStates.directLinks.translateY}px) scale(${animationStates.directLinks.scale})`,
                        boxShadow: "0 4px 14px rgba(92, 124, 250, 0.4)",
                        zIndex: 39,
                        opacity: 1,
                      }}
                      onClick={() =>
                        scrollToSection("direct-link-demo-section")
                      }
                    >
                      {t("directLinksButton")}
                    </div>

                    <div
                      ref={tagRefs.geoFilter}
                      className={`${styles.tag} text-black animate-tag`}
                      style={{
                        backgroundColor: colors.geoGreen,
                        left: originalPositions.geoFilter.left,
                        top: originalPositions.geoFilter.top,
                        transform: `translateY(${animationStates.geoFilter.translateY}px) scale(${animationStates.geoFilter.scale})`,
                        boxShadow: "0 4px 14px rgba(74, 222, 128, 0.4)",
                        zIndex: 41, // will be fixed below to stay ≤ 40
                        opacity: 1,
                      }}
                      onClick={() => scrollToSection("geo-filter-section")}
                    >
                      {t("geoFilterButton")}
                    </div>

                    <div
                      ref={tagRefs.analytics}
                      className={`${styles.tag} text-white animate-tag`}
                      style={{
                        backgroundColor: colors.analyticsBlue,
                        right: originalPositions.analytics.right,
                        top: originalPositions.analytics.top,
                        transform: `translateY(${animationStates.analytics.translateY}px) scale(${animationStates.analytics.scale})`,
                        boxShadow: "0 4px 14px rgba(81, 154, 232, 0.4)",
                        zIndex: 40,
                        opacity: 1,
                      }}
                      onClick={() => scrollToSection("analytics-section")}
                    >
                      {t("analyticsButton")}
                    </div>

                    <div
                      ref={tagRefs.shieldProtection}
                      className={`${styles.tag} text-white animate-tag`}
                      style={{
                        backgroundColor: colors.shieldGreen,
                        left: originalPositions.shieldProtection.left,
                        top: originalPositions.shieldProtection.top,
                        transform: `translateY(${animationStates.shieldProtection.translateY}px) scale(${animationStates.shieldProtection.scale})`,
                        boxShadow: "0 4px 14px rgba(0, 166, 126, 0.4)",
                        zIndex: 39,
                        opacity: 1,
                      }}
                      onClick={() =>
                        scrollToSection("shield-protection-section")
                      }
                    >
                      {t("shieldProtectionButton")}
                    </div>

                    {/* New Tag: 14-Day Free Trial - scrolls to PricingSection */}
                    <div
                      ref={tagRefs.freeTrialTag}
                      className={`${styles.tag} text-white animate-tag`}
                      style={{
                        backgroundColor: colors.freeTrialPink,
                        right: originalPositions.freeTrialTag.right,
                        top: originalPositions.freeTrialTag.top,
                        transform: `translateY(${animationStates.freeTrialTag.translateY}px) scale(${animationStates.freeTrialTag.scale})`,
                        boxShadow: "0 4px 14px rgba(255, 77, 148, 0.4)",
                        zIndex: 34,
                        opacity: 1,
                      }}
                      onClick={() => scrollToSection("pricing-section")}
                    >
                      {t("freeTrialButton")}
                    </div>

                    {/* New Tag: Beginner Friendly - scrolls to FAQSection */}
                    <div
                      ref={tagRefs.faqTag}
                      className={`${styles.tag} text-black animate-tag`}
                      style={{
                        backgroundColor: colors.friendlyYellow,
                        left: originalPositions.faqTag.left,
                        top: originalPositions.faqTag.top,
                        transform: `translateY(${animationStates.faqTag.translateY}px) scale(${animationStates.faqTag.scale})`,
                        boxShadow: "0 4px 14px rgba(255, 209, 102, 0.4)",
                        zIndex: 41, // will be fixed below to stay ≤ 40
                        opacity: 1,
                      }}
                      onClick={() => scrollToSection("faq-section")}
                    >
                      {t("beginnerFriendlyButton")}
                    </div>
                  </>
                )}

              {/* Transitioning elements - shown during animation */}
              {isClientReady && isTransitioning && windowWidth >= 1850 && (
                <>
                  {Object.keys(tagRefs).map((key, index) => {
                    const positions = tagPositions[key];
                    if (!positions) return null;

                    // Calculate exact positions to match the fixed buttons
                    const finalX = window.innerWidth - 70 - 155; // account for button width
                    const finalY = 40 + index * 60 + 15; // account for half button height
                    const delay = index * 0.12; // Increased delay for smoother staggered effect

                    // Get correct properties based on tag key
                    let bgColor, textColor, label, onClick;

                    switch (key) {
                      case "landingPages":
                        bgColor = colors.landingPink;
                        textColor = "white";
                        label = t("landingPagesButton");
                        onClick = () =>
                          scrollToSection("landing-page-demo-section");
                        break;
                      case "directLinks":
                        bgColor = colors.directBlue;
                        textColor = "white";
                        label = t("directLinksButton");
                        onClick = () =>
                          scrollToSection("direct-link-demo-section");
                        break;
                      case "geoFilter":
                        bgColor = colors.geoGreen;
                        textColor = "black";
                        label = t("geoFilterButton");
                        onClick = () => scrollToSection("geo-filter-section");
                        break;
                      case "analytics":
                        bgColor = colors.analyticsBlue;
                        textColor = "white";
                        label = t("analyticsButton");
                        onClick = () => scrollToSection("analytics-section");
                        break;
                      case "shieldProtection":
                        bgColor = colors.shieldGreen;
                        textColor = "white";
                        label = t("shieldProtectionButton");
                        onClick = () =>
                          scrollToSection("shield-protection-section");
                        break;
                      case "freeTrialTag":
                        bgColor = colors.freeTrialPink;
                        textColor = "white";
                        label = t("freeTrialButton");
                        onClick = () => scrollToSection("pricing-section");
                        break;
                      case "faqTag":
                        bgColor = colors.friendlyYellow;
                        textColor = "black";
                        label = t("beginnerFriendlyButton");
                        onClick = () => scrollToSection("faq-section");
                        break;
                    }

                    return (
                      <div
                        key={key}
                        className={`shadow-lg rounded-full px-5 py-3 font-medium text-${textColor} cursor-pointer animate-tag`}
                        style={{
                          backgroundColor: bgColor,
                          boxShadow: `0 4px 14px rgba(0, 0, 0, 0.4)`,
                          position: "fixed",
                          top: 0,
                          left: 0,
                          willChange: "transform",
                          transform: tagsFixed
                            ? `translate(${positions.fromX}px, ${positions.fromY}px)`
                            : `translate(${finalX}px, ${finalY}px)`,
                          animation: tagsFixed
                            ? `flyToSide 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`
                            : `flyToOriginal 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`,
                          zIndex: 40 - index,
                          opacity: 1,
                          "--from-x": `${positions.fromX}px`,
                          "--from-y": `${positions.fromY}px`,
                          "--to-x": `${finalX}px`,
                          "--to-y": `${finalY}px`,
                        }}
                        onClick={onClick}
                      >
                        {label}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Fixed tags that appear when scrolling past the hero section */}
      {isClientReady &&
        tagsFixed &&
        !isTransitioning &&
        windowWidth >= 1850 && (
          <div className="fixed-tags">
            <div
              className="fixed shadow-lg rounded-full px-5 py-3 font-medium text-white cursor-pointer transition-all hover:shadow-xl animate-tag"
              style={{
                backgroundColor: colors.landingPink,
                top: "20px",
                right: "70px", // Aligned with animation end position
                zIndex: 40,
                boxShadow: "0 4px 14px rgba(247, 92, 157, 0.4)",
              }}
              onClick={() => scrollToSection("landing-page-demo-section")}
            >
              {t("landingPagesButton")}
            </div>

            <div
              className="fixed shadow-lg rounded-full px-5 py-3 font-medium text-white cursor-pointer transition-all hover:shadow-xl animate-tag"
              style={{
                backgroundColor: colors.directBlue,
                top: "80px",
                right: "70px", // Aligned with animation end position
                zIndex: 39,
                boxShadow: "0 4px 14px rgba(92, 124, 250, 0.4)",
              }}
              onClick={() => scrollToSection("direct-link-demo-section")}
            >
              {t("directLinksButton")}
            </div>

            <div
              className="fixed shadow-lg rounded-full px-5 py-3 font-medium text-black cursor-pointer transition-all hover:shadow-xl animate-tag"
              style={{
                backgroundColor: colors.geoGreen,
                top: "140px",
                right: "70px", // Aligned with animation end position
                zIndex: 38,
                boxShadow: "0 4px 14px rgba(74, 222, 128, 0.4)",
              }}
              onClick={() => scrollToSection("geo-filter-section")}
            >
              {t("geoFilterButton")}
            </div>

            <div
              className="fixed shadow-lg rounded-full px-5 py-3 font-medium text-white cursor-pointer transition-all hover:shadow-xl animate-tag"
              style={{
                backgroundColor: colors.analyticsBlue,
                top: "200px",
                right: "70px", // Aligned with animation end position
                zIndex: 37,
                boxShadow: "0 4px 14px rgba(81, 154, 232, 0.4)",
              }}
              onClick={() => scrollToSection("analytics-section")}
            >
              {t("analyticsButton")}
            </div>

            <div
              className="fixed shadow-lg rounded-full px-5 py-3 font-medium text-white cursor-pointer transition-all hover:shadow-xl animate-tag"
              style={{
                backgroundColor: colors.shieldGreen,
                top: "260px",
                right: "70px", // Aligned with animation end position
                zIndex: 36,
                boxShadow: "0 4px 14px rgba(0, 166, 126, 0.4)",
              }}
              onClick={() => scrollToSection("shield-protection-section")}
            >
              {t("shieldProtectionButton")}
            </div>

            {/* New Tag: 14-Day Free Trial - scrolls to PricingSection */}
            <div
              className="fixed shadow-lg rounded-full px-5 py-3 font-medium text-white cursor-pointer transition-all hover:shadow-xl animate-tag"
              style={{
                backgroundColor: colors.freeTrialPink,
                top: "320px",
                right: "70px", // Aligned with animation end position
                zIndex: 34,
                boxShadow: "0 4px 14px rgba(255, 77, 148, 0.4)",
              }}
              onClick={() => scrollToSection("pricing-section")}
            >
              {t("freeTrialButton")}
            </div>

            {/* New Tag: Beginner Friendly - scrolls to FAQSection */}
            <div
              className="fixed shadow-lg rounded-full px-5 py-3 font-medium text-black cursor-pointer transition-all hover:shadow-xl animate-tag"
              style={{
                backgroundColor: colors.friendlyYellow,
                top: "380px",
                right: "70px", // Aligned with animation end position
                zIndex: 33,
                boxShadow: "0 4px 14px rgba(255, 209, 102, 0.4)",
              }}
              onClick={() => scrollToSection("faq-section")}
            >
              {t("beginnerFriendlyButton")}
            </div>
          </div>
        )}
    </>
  );
}
