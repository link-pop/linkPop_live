"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/utils/constants";
import Logo from "@/components/Nav/Header/Logo";
import { SITE1 } from "@/config/env";

export default function AppLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [theme, setTheme] = useState("light");
  const pathname = usePathname();
  const isMainPage = pathname === "/";
  const isSignInPage = pathname?.includes("/sign-in");

  useEffect(() => {
    // Don't show loader on sign-in page
    if (isSignInPage) {
      setIsVisible(false);
      return;
    }

    // Get theme from localStorage only on client side
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);

    const timer = setTimeout(() => {
      setOpacity(0);
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isSignInPage]);

  if (!isVisible) return null;
  const themeBg = theme === "light" ? "bg-white" : "bg-black";
  const themeText = theme === "light" ? "text-black" : "text-white";

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${
        isMainPage ? themeBg : themeBg
      }`}
      style={{
        opacity,
        transition: "opacity 2s ease-in-out",
        zIndex: 999999,
      }}
    >
      <div className="w-fit h-32 relative flex items-center justify-center px-8">
        <h1
          className={`text-4xl text-center tracking-wider [font-family:var(--font-card)] ${
            isMainPage ? themeText : themeText
          }`}
          style={{
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <Logo className="motion-preset-pulse motion-duration-[2000ms] scale-[1.5]" />

          {/* {APP_NAME} */}
        </h1>
      </div>
    </div>
  );
}
