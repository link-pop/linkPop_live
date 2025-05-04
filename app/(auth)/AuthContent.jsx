"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { SITE2 } from "@/config/env";
import { useEffect } from "react";

// ! code start AuthContent
const AuthContent = () => {
  const { t, currentLang } = useTranslation();

  // Use useEffect to translate Clerk auth components using DOM manipulation
  useEffect(() => {
    const translateClerkElements = () => {
      // Find Clerk elements by their data-localization-key attributes
      const translateElement = (key, fallbackSelector = null) => {
        // First try to find element by data-localization-key
        let element = document.querySelector(`[data-localization-key="${key}"]`);
        
        // If not found and fallback selector provided, try that
        if (!element && fallbackSelector) {
          element = document.querySelector(fallbackSelector);
        }
        
        // If element found, update its text content with translation
        if (element) {
          element.textContent = t(key);
        }
      };

      // Translate all the Clerk UI elements
      translateElement("signIn.start.title", ".cl-headerTitle");
      translateElement("signIn.start.subtitle", ".cl-headerSubtitle");
      translateElement("dividerText", ".cl-dividerText");
      translateElement("formFieldLabel__emailAddress", '[for="identifier-field"]');
      translateElement("formFieldLabel__password", '[for="password-field"]');
      translateElement("formButtonPrimary", ".cl-formButtonPrimary");
      translateElement("signIn.start.actionText", ".cl-footerActionText");
      translateElement("signIn.start.actionLink", ".cl-footerActionLink");

      // Update placeholders in input fields
      const emailInput = document.querySelector('#identifier-field');
      if (emailInput) {
        emailInput.placeholder = t("enterYourEmailAddress");
      }

      const passwordInput = document.querySelector('#password-field');
      if (passwordInput) {
        passwordInput.placeholder = t("enterYourPassword");
      }

      // Update button text (has a nested span)
      const continueButton = document.querySelector('.cl-formButtonPrimary span');
      if (continueButton) {
        continueButton.textContent = t("continue");
      }
    };

    // Initial translation
    translateClerkElements();

    // Set up a mutation observer to detect when Clerk elements are added to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          setTimeout(translateClerkElements, 100);
        }
      });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Clean up the observer when component unmounts
    return () => {
      observer.disconnect();
    };
  }, [t, currentLang]);

  if (SITE2) {
    return (
      <>
        <p className={`fz38 tac por z-10 white tracking-[1.5]`}>{t("signIn")}</p>
        <p className={`fz15 tal por l5 z-10 white`}>{t("toPowerUpYourLinks")}</p>
        <p className={`fz15 tal por l5 z-10 white`}>{t("andProtectYourBrand")}</p>
      </>
    );
  }

  return (
    <>
      <p className={`fz38 tac por z-10 white tracking-[1.5]`}>{t("signIn")}</p>
      <p className={`fz15 tal por l5 z-10 white`}>{t("toSupportYour")}</p>
      <p className={`fz15 tal por l5 z-10 white`}>{t("favoriteCreators")}</p>
    </>
  );
};

export default AuthContent;
// ? code end AuthContent 