"use client";

import { Circle } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function LanguagePopup({ dialogSet }) {
  const { currentLang, setLanguage, languages } = useTranslation();

  const handleLanguageChange = (code) => {
    setLanguage(code);
    dialogSet({ isOpen: false });
  };

  return (
    <div className={`fc g10`}>
      {Object.entries(languages).map(([code, { name }]) => (
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
