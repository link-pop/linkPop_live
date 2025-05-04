"use client";

import { useState, useEffect } from "react";

export function useUrlParams() {
  const [params, setParams] = useState(new URLSearchParams());

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setParams(searchParams);

      // Listen for popstate events (back/forward navigation)
      const handlePopState = () => {
        const newParams = new URLSearchParams(window.location.search);
        setParams(newParams);
      };

      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, []);

  const get = (key) => params.get(key);
  const getAll = (key) => params.getAll(key);
  const toString = () => params.toString();
  const entries = () => Array.from(params.entries());

  return {
    get,
    getAll,
    toString,
    entries,
  };
}
