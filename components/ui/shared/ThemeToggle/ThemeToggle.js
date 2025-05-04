"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../ThemeProvider/ThemeProvider";
import { useTranslation } from "@/components/Context/TranslationContext";
import { MENU_CLASS } from "@/lib/utils/constants";

export function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div
      onClick={toggleTheme}
      className={`${MENU_CLASS} ${className}`}
      title={theme === "light" ? t("darkMode") : t("lightMode")}
    >
      {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
      <span>{theme === "light" ? t("darkMode") : t("lightMode")}</span>
    </div>
  );
}
