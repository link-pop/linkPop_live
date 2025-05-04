"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function AnimatedNavItem({
  children,
  className = "",
  isActive,
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95, translateX: 10 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`group hover:brand ${isActive ? "brand" : ""} ${className}`}
    >
      <div className="relative flex items-center gap-1 px-4">
        <div
          className={`absolute left-0 transform ${
            isActive
              ? "translate-x-0 opacity-100"
              : "-translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
          } transition-all duration-200`}
        >
          <ChevronRight className="brand w-4 h-4" />
        </div>
        <span className="relative">{children}</span>
        <motion.span
          className="absolute bottom-0 left-0 w-full h-[2px] bg-brand opacity-0 group-hover:opacity-100"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </motion.div>
  );
}
