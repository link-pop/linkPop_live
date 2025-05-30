"use client";

import { useState } from "react";

/**
 * Custom hook for managing price filter state
 * @param {boolean} defaultShowPaidOnly - Default filter state (true = paid only, false = free only)
 * @returns {Object} Price filter state and controls
 */
export function usePriceFilter(defaultShowPaidOnly = true) {
  const [showPaidOnly, setShowPaidOnly] = useState(defaultShowPaidOnly);

  const toggleFilter = (newValue) => {
    if (typeof newValue === "boolean") {
      setShowPaidOnly(newValue);
    } else {
      setShowPaidOnly((prev) => !prev);
    }
  };

  const resetFilter = () => {
    setShowPaidOnly(defaultShowPaidOnly);
  };

  return {
    showPaidOnly,
    setShowPaidOnly,
    toggleFilter,
    resetFilter,
  };
}
