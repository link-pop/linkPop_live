"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";
import { useUrlParams } from "@/hooks/useUrlParams";
import { usePathname } from "next/navigation";
import { CHATS_ROUTE } from "@/lib/utils/constants";

const ScrollTop = () => {
  // Move pathname check before hooks
  const pathname = usePathname();
  if ([CHATS_ROUTE].includes(pathname)) return null;

  const urlParams = useUrlParams();
  const [isAtTop, setIsAtTop] = useState(true);
  const [isDarkBg, setIsDarkBg] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const buttonRef = useRef(null);

  const getBgColor = (element) => {
    const computed = window.getComputedStyle(element);
    const bg = computed.backgroundColor;

    // If background is transparent, check parent
    if (bg === "transparent" || bg === "rgba(0, 0, 0, 0)") {
      if (element.parentElement) {
        return getBgColor(element.parentElement);
      }
      return "rgb(255, 255, 255)"; // default to white if no bg found
    }

    return bg;
  };

  const updateButtonColor = () => {
    if (!buttonRef.current) return;

    // Get position just below the button
    const rect = buttonRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.bottom + 5; // Check 5px below the button

    const elementBelow = document.elementFromPoint(x, y);
    if (!elementBelow) return;

    const bgColor = getBgColor(elementBelow);
    const rgb = bgColor.match(/\d+/g);

    if (rgb) {
      const [r, g, b] = rgb.map(Number);
      // Calculate perceived brightness
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      setIsDarkBg(brightness < 128);
    }
  };

  useEffect(() => {
    const checkScrollability = () => {
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      setShowButton(documentHeight > windowHeight);
    };

    const handleScroll = () => {
      const position = window.scrollY;
      setIsAtTop(position === 0);
      updateButtonColor();
      checkScrollability();
    };

    // Initial check
    handleScroll();

    // Add event listeners
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", () => {
      updateButtonColor();
      checkScrollability();
    });

    // Check periodically for any dynamic content changes
    const observer = new MutationObserver(() => {
      updateButtonColor();
      checkScrollability();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", () => {
        updateButtonColor();
        checkScrollability();
      });
      observer.disconnect();
    };
  }, []);

  // ! Effect to check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      // ! don't change this to 768 or other breakpoints !
      setIsMobile(window.innerWidth <= 1100);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Effect to check scrollability when url params change
  useEffect(() => {
    // Wait for next tick to ensure DOM has updated
    const timer = setTimeout(() => {
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      setShowButton(documentHeight > windowHeight);
    }, 100);

    return () => clearTimeout(timer);
  }, [urlParams]);

  const scrollToPosition = (position) => {
    window.scrollTo({
      top: position,
      behavior: "smooth",
    });
  };

  const scrollToBottom = () => {
    scrollToPosition(document.documentElement.scrollHeight);
  };

  const scrollToTop = () => {
    scrollToPosition(0);
  };

  return (
    <button
      ref={buttonRef}
      onClick={isAtTop ? scrollToBottom : scrollToTop}
      style={{
        backgroundColor: isDarkBg ? "#ffffff" : "var(--color-brand)",
        color: isDarkBg ? "var(--color-brand)" : "#ffffff",
        transition: "background-color 0.3s ease, color 0.3s ease",
        display: showButton ? "block" : "none",
      }}
      className={`fixed opacity-80 hover:opacity-50 active:opacity-30 p-3 rounded-full shadow-lg transition-colors duration-300 z-50 overflow-hidden active:scale-[.95] w45 h45 b15 r15 ${
        isMobile ? "!dn" : ""
      }`}
      aria-label={isAtTop ? "Scroll to bottom" : "Scroll to top"}
    >
      <div
        className={`fcc transform transition-transform duration-300 ${
          isAtTop ? "rotate-0" : "rotate-180"
        }`}
      >
        <ArrowDown className="w-5 h-5" />
      </div>
    </button>
  );
};

export default ScrollTop;
