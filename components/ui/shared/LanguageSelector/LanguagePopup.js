"use client";

import { Circle } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { SITE1 } from "@/config/env";

export default function LanguagePopup({ dialogSet }) {
  const { currentLang, setLanguage, languages } = useTranslation();

  const handleLanguageChange = (code) => {
    setLanguage(code);
    dialogSet({ isOpen: false });
  };

  // Filter languages for SITE1 to show only English and Ukrainian
  const filteredLanguages = SITE1
    ? Object.entries(languages).filter(
        ([code]) => code === "en" || code === "uk"
      )
    : Object.entries(languages);

  return (
    <div className={`fc g10`}>
      {filteredLanguages.map(([code, { name }]) => (
        <div
          key={code}
          className={`f g10 aic cp p10 br5 hover:bg-accent`}
          onClick={() => handleLanguageChange(code)}
        >
          <Circle
            className={`${currentLang === code ? "brand" : "gray"}`}
            size={20}
            fill={currentLang === code ? "currentColor" : "none"}
          />
          <span>{name}</span>
        </div>
      ))}
    </div>
  );
}
