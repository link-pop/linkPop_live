"use client";

import { useState, useEffect } from "react";
import { MOBILE, MOBILE_SM } from "@/lib/utils/constants";

// TODO !!! don;t use useWindowWidth if tailwind is capable of handling it
export default function useWindowWidth() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSm, setIsMobileSm] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE);
      setWindowWidth(window.innerWidth);
      setIsMobileSm(window.innerWidth < MOBILE_SM);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return { isMobile, isMobileSm, windowWidth };
}
