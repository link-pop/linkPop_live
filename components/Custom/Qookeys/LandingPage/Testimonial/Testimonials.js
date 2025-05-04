"use client";

import { Card, CardContent } from "@/components/ui/card";
import StarRating from "@/components/ui/shared/StarRating/StarRating";
import { QuoteIcon } from "./QuoteIcon";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Testimonial from "@/components/Custom/Qookeys/LandingPage/Testimonial/Testimonial";

const testimonials = [
  {
    quote:
      "I wasted my weekend trying to activate Windows 11 Pro with support and could not. Coolkeys solved my problem in less than 5 minutes!",
    author: "John B",
    location: "New York, USA",
    rating: 5,
  },
  {
    quote:
      "Some places will sell you a key for cheaper than Coolkeys but had me running around. Coolkeys sent me a legit activation code right off the bat.",
    author: "TheWarMotor",
    location: "Los Angeles, USA",
    rating: 4,
  },
  {
    quote:
      "Purchase was a breeze and seller communication timely and excellent. Activation with the key went smoothly, with no hiccups or glitches.",
    author: "Mark",
    location: "San Francisco, USA",
    rating: 5,
  },
];

export default function Testimonials() {
  const trustpilotRating = 4.7;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  return (
    <div ref={ref} className="py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h2 className="black text-3xl font-bold tracking-tight">
            TRUSTPILOT
          </h2>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={
              isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }
            }
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-2"
          >
            <StarRating
              readonly={true}
              rating={trustpilotRating}
              totalStars={5}
            />
            <span className="text-xl font-semibold black">
              {trustpilotRating}
            </span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            While our website features numerous reviews, we also use Trustpilot
            to enhance transparency. This ensures that all reviews are authentic
            and beyond our control.
          </motion.p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: i * 0.2 + 0.4 }}
            >
              <Testimonial {...testimonial} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
