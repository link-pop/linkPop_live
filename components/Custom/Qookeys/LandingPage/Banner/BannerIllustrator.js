"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const BannerIllustrator = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <div
      ref={ref}
      className="saturate-[.8] !opacity-100 relative min-h-[500px] w-full overflow-hidden bg-[#FF9A00] flex items-center justify-center"
    >
      {/* Background shapes inspired by vector graphics */}
      <motion.div
        initial={{ x: "-50%", y: "-50%", scale: 0, rotate: 0 }}
        animate={isInView ? { scale: 1, rotate: 45 } : { scale: 0, rotate: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-0 left-0 w-32 h-32 bg-white/20 border-4 border-white polygon-clip-path -translate-x-1/2 -translate-y-1/2"
      />
      <motion.div
        initial={{ x: "25%", y: "25%", scale: 0, rotate: 0 }}
        animate={isInView ? { scale: 1, rotate: -45 } : { scale: 0, rotate: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute bottom-0 right-0 w-48 h-48 bg-white/20 border-4 border-white polygon-clip-path translate-x-1/4 translate-y-1/4"
      />
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={isInView ? { scale: 1, rotate: 15 } : { scale: 0, rotate: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/30 polygon-clip-path opacity-50 transform rotate-45"
      />
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={isInView ? { scale: 1, rotate: -15 } : { scale: 0, rotate: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="absolute bottom-1/4 left-1/4 w-36 h-36 bg-white/30 polygon-clip-path opacity-50 transform -rotate-45"
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
          ADOBE ILLUSTRATOR KEYS
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg md:text-xl text-white/90"
        >
          Activate your Adobe Illustrator
        </motion.p>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/products?category=adobe+illustrator"
            className="bg-white text-[#FF9A00] hover:bg-white/90 py-4 px-6 rounded-lg text-lg font-bold"
          >
            Browse Illustrator Keys
          </Link>
        </motion.div>
      </motion.div>
      <style jsx>{`
        .polygon-clip-path {
          clip-path: polygon(
            25% 0%,
            75% 0%,
            100% 25%,
            100% 75%,
            75% 100%,
            25% 100%,
            0% 75%,
            0% 25%
          );
        }
      `}</style>
    </div>
  );
};

const BannerIllustratorShrink = () => {
  const shrinkTitle = "ILLUSTRATOR".split("");

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
      {/* <div className="absolute top-0 left-0 w-16 h-16 bg-white/20 polygon-clip-path transform -translate-x-1/2 -translate-y-1/2 rotate-45" />
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/20 polygon-clip-path transform translate-x-1/2 translate-y-1/2 -rotate-45" /> */}
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
        .polygon-clip-path {
          clip-path: polygon(
            25% 0%,
            75% 0%,
            100% 25%,
            100% 75%,
            75% 100%,
            25% 100%,
            0% 75%,
            0% 25%
          );
        }
      `}</style>
    </div>
  );
};

export { BannerIllustrator, BannerIllustratorShrink };
