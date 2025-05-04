"use client";

import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

const BannerWindows = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <div
      ref={ref}
      className="saturate-[.8] !opacity-100 relative min-h-[500px] w-full overflow-hidden bg-[#4169E1] flex items-center justify-center"
    >
      {/* Background shapes */}
      <motion.div
        initial={{ x: "-50%", y: "-50%", scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-0 left-0 w-32 h-32 bg-yellow-400 rounded-full -translate-x-1/2 -translate-y-1/2"
      />
      <motion.div
        initial={{ x: "25%", y: "25%", scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute bottom-0 right-0 w-48 h-48 bg-yellow-400 rounded-full translate-x-1/4 translate-y-1/4"
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="absolute top-1/2 right-1/4 w-24 h-24 bg-blue-800 rounded-full opacity-50"
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="absolute bottom-1/4 left-1/4 w-36 h-36 bg-blue-800 rounded-full opacity-50"
      />

      {/* Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative z-10 text-center space-y-6 px-4 -mt150"
      >
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-4xl md:text-6xl font-bold text-white tracking-tight"
        >
          MICROSOFT WINDOWS KEYS
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg md:text-xl text-white/90"
        >
          Activate your Windows Operating System
        </motion.p>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/products?category=windows"
            className="bg-white text-blue-600 hover:bg-white/90 py-3 px-6 rounded-lg text-lg font-bold"
          >
            Browse Windows Keys
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

const BannerWindowsShrink = () => {
  const shrinkTitle = "WINDOWS".split("");

  return (
    <div className="saturate-[.8] !opacity-100 relative h-full w-full border-2 flex items-center justify-center overflow-hidden">
      <div className="text-[#333333] text-center flex flex-col items-center">
        {shrinkTitle.map((letter, index) => (
          <h3
            key={index}
            className="text-xl font-bold leading-tight"
            style={{
              animationDelay: `${index * 0.1}s`,
              opacity: 0,
              animation: "fadeInVertical 0.5s forwards",
            }}
          >
            {letter}
          </h3>
        ))}
      </div>
      {/* <div className="absolute top-0 left-0 w-16 h-16 bg-yellow-400/20 rounded-br-lg transform -translate-x-1/2 -translate-y-1/2 rotate-45" /> */}
      {/* <div className="absolute bottom-0 right-0 w-16 h-16 bg-blue-800/20 rounded-tl-lg transform translate-x-1/2 translate-y-1/2 -rotate-45" /> */}
      <style jsx>{`
        @keyframes fadeInVertical {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export { BannerWindows, BannerWindowsShrink };
