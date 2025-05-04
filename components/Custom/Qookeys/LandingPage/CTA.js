"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import Link from "next/link";
import { ADD_CONTACT_ROUTE } from "@/lib/utils/constants";
import { useRef } from "react";

export default function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const textVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
      },
    }),
  };

  return (
    <div
      ref={ref}
      className="pb80 pt125 px100 white fcc lg:gap-[225px] aic bg-blue-500 relative"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={
          isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }
        }
        transition={{ duration: 0.6 }}
        className="fw700 fz60 sm:fz100 ttu leading-tight"
      >
        <motion.div
          custom={0}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={textVariants}
        >
          It&apos;s time
        </motion.div>
        <motion.div
          custom={1}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={textVariants}
        >
          to
        </motion.div>
        <motion.div
          custom={2}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={textVariants}
        >
          ACTIVATE
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="fc asfs mt30"
      >
        <div className="tar fz20 sm:fz25">
          Do you have any questions? Feel <br />
          free to contact us anytime.
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt20 mla"
        >
          <Button className="bg-white text-blue-600 hover:bg-white/90">
            <Link href={ADD_CONTACT_ROUTE}>Contact Us</Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
