"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { REVIEWS_ROUTE } from "@/lib/utils/constants";
import HeroBannerCTAButton from "./HeroBannerCTAButton";

export default function HeroBanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <div
      ref={ref}
      className="max-w-[var(--maw-app)] mx-auto mt-16 sm:mt5 px-4 sm:px-6 flex flex-col justify-center items-center min-h-[80vh] w-full"
    >
      <div className="w-full">
        <div className="flex flex-col min-[930px]:flex-row aic max-w-[1100px] mxa">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 md:basis-[51%]"
          >
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="fz14 min-[930px]:fz16 text-gray-600 tracking-widest text-base mb-6 md:mr-[20%]"
            >
              Shop for software and apps
            </motion.p>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[#333333] text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight uppercase mb-6"
            >
              Activate <br /> your <br /> apps
            </motion.h2>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="fc aic sm:flex-row gap-4 mt-6"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/products" prefetch={true}>
                  <HeroBannerCTAButton text="Browse Products" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={`${REVIEWS_ROUTE}?reviewed_collection=products`}
                  className="h60 fz12 ttu fcc px-6 border-2 border-blue-600 text-blue-600 rounded-md hover:bg-gray-100 transition-colors text-center"
                >
                  Reviews
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 mt-8 md:mt-0 md:flex md:justify-end"
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={isInView ? { scale: 1 } : { scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              src="/img/banner.svg"
              alt="Coolkeys PC Activate"
              className="wf max-w-[350px] min-[640px]:min-w-[400px] min-[768px]:min-w-[480px] min-[1030px]:min-w-[520px] min-[1200px]:min-w-[600px] min-[1400px]:min-w-[640px] ha mxa md:mx0"
              width={440}
              height={835}
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
