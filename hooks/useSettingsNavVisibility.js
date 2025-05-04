"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function useSettingsNavVisibility() {
  const pathname = usePathname();
  const [showNav, setShowNav] = useState(true);

  useEffect(() => {
    const checkNav = () => {
      const isMobile = window.innerWidth <= 600;
      const isSubpage = pathname !== "/my/settings";
      setShowNav(!isMobile || !isSubpage);
    };

    checkNav();
    window.addEventListener("resize", checkNav);
    return () => window.removeEventListener("resize", checkNav);
  }, [pathname]);

  return showNav;
}
