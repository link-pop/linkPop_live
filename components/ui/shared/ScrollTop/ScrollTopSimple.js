"use client";

import { useState, useEffect } from "react";
import { ArrowDown } from "lucide-react";
import { useUrlParams } from "@/hooks/useUrlParams";
import { usePathname } from "next/navigation";
import { BRAND_INVERT_CLASS, CHATS_ROUTE } from "@/lib/utils/constants";
import { SITE1, SITE2 } from "@/config/env";

export default function ScrollTopSimple() {
  // Move pathname check before hooks
  const pathname = usePathname();
  if ([CHATS_ROUTE].includes(pathname)) return null;

  const urlParams = useUrlParams();
  const [isAtTop, setIsAtTop] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScrollability = () => {
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      setShowButton(documentHeight > windowHeight);
    };

    const handleScroll = () => {
      const position = window.scrollY;
      setIsAtTop(position === 0);
      checkScrollability();
    };

    // Initial check
    handleScroll();

    // Add event listeners
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", checkScrollability);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkScrollability);
    };
  }, []);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Effect to check scrollability when url params change
  useEffect(() => {
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
      onClick={isAtTop ? scrollToBottom : scrollToTop}
      style={{
        backgroundColor: "var(--color-brand)",
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
        <ArrowDown
          className={`w-5 h-5 ${SITE1 ? BRAND_INVERT_CLASS : "white"}`}
        />
      </div>
    </button>
  );
}
