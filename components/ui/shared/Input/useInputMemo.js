"use client";

import { useEffect } from "react";

export default function useInputMemo(props) {
  const shouldUseMemo =
    typeof window !== "undefined" && window.location.pathname.includes("/add/");

  function onChange(e) {
    if (!shouldUseMemo) return props.onChange?.(e);

    // Handle both event objects and direct values
    const value = e?.target?.value ?? e;
    const name = props.name;

    // for memo on page reload
    localStorage.setItem(`${name}`, value);
    props.onChange?.(e);
  }

  function defaultValue() {
    if (!shouldUseMemo) return props?.defaultValue;
    if (typeof window === "undefined") return props?.defaultValue;
    return localStorage.getItem(`${props.name}`) || props?.defaultValue;
  }

  useEffect(() => {
    if (!shouldUseMemo) return;

    const form = document.querySelector("form");
    if (!form) return;

    const handleSubmit = () => {
      setTimeout(() => {
        localStorage.removeItem(`${props.name}`); // * remove memo on submit
        // ! reset form is only needed if you stay on the same page
        // document.querySelector("form")?.reset(); // reset form
      }, 1000);
    };

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, [props.name, shouldUseMemo]);

  return {
    onChange,
    defaultValue,
  };
}
