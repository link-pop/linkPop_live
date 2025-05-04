"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Pill, PieChart, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const features = [
    {
      icon: Pill,
      title: "Instant Delivery",
      description:
        "Coolkeys offers the convenience of instant delivery product keys through your email. No need to wait for parcels.",
    },
    {
      icon: PieChart,
      title: "Safe, Genuine Activation",
      description:
        "We provide genuine product keys for your apps, ensuring a secure and reliable experience. Not just unbeatable deals, but secure.",
    },
    {
      icon: Settings,
      title: "After Sales Support",
      description:
        "Tech is not easy for everyone. We got you covered! Every customer at Coolkeys are entitled with free after-sales support.",
    },
  ];

  return (
    <section ref={ref} className="py-12 px-4 md:px-6 bg_bg" id="whyUs">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        className="black text-3xl font-bold text-center mb-12"
      >
        3 REASONS
      </motion.h2>
      <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <Card className="border-none shadow-none hf">
              <CardContent className="pt-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{
                    type: "spring",
                    duration: 0.8,
                    delay: index * 0.2 + 0.3,
                  }}
                  className="mb-4 inline-flex items-center justify-center rounded-full bg-gray-100 p-3"
                >
                  <feature.icon className="h-6 w-6" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
