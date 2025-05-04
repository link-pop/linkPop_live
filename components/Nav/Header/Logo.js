"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE2 } from "@/config/env";
import { useTheme } from "@/components/ui/shared/ThemeProvider/ThemeProvider";

export default function Logo({ className = "", height = "40px" }) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (pathname === "/") {
      document.querySelector(".Logo")?.classList.add("aconfetti");
    } else {
      document.querySelector(".Logo")?.classList.remove("aconfetti");
    }
  }, [pathname]);

  // Only show theme-specific content after mounting to avoid hydration mismatch
  const themeImg = theme === "light" ? "/img/logo.svg" : "/img/logoDark.svg";
  const themeImg2 = theme === "light" ? "/img/logo2.png" : "/img/logoDark2.png";

  if (!mounted) {
    // Return a placeholder during SSR to avoid hydration issues
    return (
      <Link href="/" className={`Logo dib ${className}`}>
        <div style={{ height, width: height * 2.5 }} />
      </Link>
    );
  }

  return (
    <Link href="/" className={`Logo dib ${className}`}>
      {SITE2 ? (
        <img src={themeImg2} style={{ height }} />
      ) : (
        <img src={themeImg} style={{ height }} />
      )}
    </Link>
  );
}
