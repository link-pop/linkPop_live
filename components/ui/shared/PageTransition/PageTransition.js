"use client";

import { motion } from "framer-motion";

const PageTransition = ({ children }) => {
  return (
    <div className="relative">
      {/* Content */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.div>

      {/* Blue overlay */}
      <motion.div
        className="fixed top-0 left-0 bottom-0 z-[15] bg-blue-500 pointer-events-none"
        initial={{ width: "100%", opacity: 1 }}
        animate={{ width: "0%", opacity: 1 }}
        exit={{ width: "100%", opacity: 1 }}
        transition={{
          duration: 0.4,
          ease: [0.65, 0, 0.35, 1],
        }}
      />
    </div>
  );
};

export default PageTransition;
