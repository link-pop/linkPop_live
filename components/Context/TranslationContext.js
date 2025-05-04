"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getTranslation, languages } from "@/data/locales";

// Create the context
const TranslationContext = createContext();

// Provider component
export function TranslationProvider({ children, initialLang = "en" }) {
  const [currentLang, setCurrentLang] = useState(initialLang);

  useEffect(() => {
    // If initialLang is provided from props, use it
    if (initialLang !== "en") {
      setCurrentLang(initialLang);
    } else {
      // Get language from localStorage or default to "en"
      const savedLang = localStorage.getItem("selectedLanguage") || "en";
      setCurrentLang(savedLang);
    }

    // Update HTML lang attribute
    document.documentElement.lang = currentLang;
    // Update direction for RTL languages
    document.documentElement.dir = ["ar", "fa", "ur"].includes(currentLang)
      ? "rtl"
      : "ltr";
  }, [initialLang]);

  // Update lang attributes when currentLang changes
  useEffect(() => {
    // Update HTML lang attribute
    document.documentElement.lang = currentLang;
    // Update direction for RTL languages
    document.documentElement.dir = ["ar", "fa", "ur"].includes(currentLang)
      ? "rtl"
      : "ltr";
  }, [currentLang]);

  // Enhanced t function to handle parameters
  const t = (key, params = {}) => {
    let translation = getTranslation(key, currentLang);

    // Replace parameters in the translation string
    if (params && Object.keys(params).length > 0) {
      Object.keys(params).forEach((param) => {
        const regex = new RegExp(`{{${param}}}`, "g");
        translation = translation.replace(regex, params[param]);
      });
    }

    return translation;
  };

  const setLanguage = (lang) => {
    if (languages[lang]) {
      localStorage.setItem("selectedLanguage", lang);
      setCurrentLang(lang);
    }
  };

  const value = {
    t,
    currentLang,
    setLanguage,
    languages,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

// Custom hook to use the translation context
export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
