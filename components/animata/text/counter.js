"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export const Formatter = {
  number: (value) => Intl.NumberFormat("en-US").format(+value.toFixed(0)),
  currency: (value) =>
    Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      +value.toFixed(0)
    ),
};

export default function Counter({
  format = Formatter.number,
  targetValue,
  direction = "up",
  delay = 0,
  className,
}) {
  const ref = useRef(null);
  const isGoingUp = direction === "up";
  const motionValue = useMotionValue(isGoingUp ? 0 : targetValue);

  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 80,
  });
  const isInView = useInView(ref, { margin: "0px", once: true });

  useEffect(() => {
    if (!isInView) {
      return;
    }

    const timer = setTimeout(() => {
      motionValue.set(isGoingUp ? targetValue : 0);
    }, delay);

    return () => clearTimeout(timer);
  }, [isInView, delay, isGoingUp, targetValue, motionValue]);

  useEffect(() => {
    springValue.on("change", (value) => {
      if (ref.current) {
        ref.current.textContent = format ? format(value) : value;
      }
    });
  }, [springValue, format]);

  return <span ref={ref} className={className} />;
}
