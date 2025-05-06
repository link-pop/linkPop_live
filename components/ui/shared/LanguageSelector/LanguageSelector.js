"use client";

import { useContext } from "@/components/Context/Context";
import { useTranslation } from "@/components/Context/TranslationContext";
import LanguagePopup from "./LanguagePopup";
import { Globe } from "lucide-react";
import { MENU_CLASS } from "@/lib/utils/constants";

export default function LanguageSelector({ className = "" }) {
  const { dialogSet } = useContext();
  const { currentLang, languages } = useTranslation();

  const showLanguagePopup = () => {
    dialogSet({ isOpen: false });
    dialogSet({
      isOpen: true,
      showBtns: false,
      contentClassName: "!w250 max-h-[90dvh] oys",
      hasCloseIcon: true,
      fixedCloseIcon: true,
      comp: <LanguagePopup {...{ dialogSet }} />,
    });
  };

  return (
    <div className={`${MENU_CLASS} ${className}`} onClick={showLanguagePopup}>
      <Globe className="w24 h24" />
      {languages[currentLang].name}
    </div>
  );
}
