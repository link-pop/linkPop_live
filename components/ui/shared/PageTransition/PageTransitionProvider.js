"use client";

import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";
import { usePathname } from "next/navigation";

const PageTransitionProvider = ({ children }) => {
  const pathname = usePathname();

  return (
    <div style={{ position: "relative" }}>
      <AnimatePresence mode="wait">
        <PageTransition key={pathname}>{children}</PageTransition>
      </AnimatePresence>
    </div>
  );
};

export default PageTransitionProvider;
