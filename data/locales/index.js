// ! code start translation index
import { SITE1, SITE2 } from "../../config/env";

// Import language files based on site configuration
let en, uk, es, hi, fr, zh;

if (SITE2) {
  en = require("./en2").default;
  uk = require("./uk2").default;
  es = require("./es2").default;
  hi = require("./hi2").default;
  fr = require("./fr2").default;
  zh = require("./zh2").default;
} else if (SITE1) {
  en = require("./en1").default; // add en1 later
  uk = require("./uk1").default; // add en1 later
  es = require("./es2").default; // add en1 later
  hi = require("./hi2").default; // add hi1 later
  fr = require("./fr2").default; // add fr1 later
  zh = require("./zh2").default; // add zh1 later
} else {
  // Fallback to default translations if neither site is specified
  en = require("./en2").default;
  uk = require("./uk2").default;
  es = require("./es2").default;
  hi = require("./hi2").default;
  fr = require("./fr2").default;
  zh = require("./zh2").default;
}

// Define available languages
export const languages = {
  en: { name: "English" },
  uk: { name: "Українська" },
  es: { name: "Español" },
  hi: { name: "हिन्दी" },
  fr: { name: "Français" },
  zh: { name: "中文" },
};

// Import all language files
const translations = {
  en,
  uk,
  es,
  hi,
  fr,
  zh,
  // Add more imports as you add more language files
};

// Auto-fill missing translations with English (fallback mechanism)
Object.keys(languages).forEach((lang) => {
  if (!translations[lang]) {
    translations[lang] = { ...translations.en };
  } else {
    Object.keys(translations.en).forEach((key) => {
      if (!translations[lang][key]) {
        translations[lang][key] = translations.en[key];
      }
    });
  }
});

/**
 * Get translation for a specific key and language
 * @param {string} key - The translation key
 * @param {string} lang - The language code (defaults to 'en')
 * @returns {string} The translated string or the key itself if not found
 */
export function getTranslation(key, lang = "en") {
  // Get the translation string from the translations object
  const translationStr =
    translations[lang]?.[key] || translations.en[key] || key;

  // If the translation is a function, call it with the parameters
  if (typeof translationStr === "function") {
    return translationStr;
  }

  return translationStr;
}
// ? code end translation index
