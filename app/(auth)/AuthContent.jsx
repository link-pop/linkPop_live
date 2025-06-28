"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { SITE2 } from "@/config/env";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/shared/LoadingSpinner/LoadingSpinner";

// ! code start AuthContent
const AuthContent = () => {
  const { t, currentLang } = useTranslation();
  const [showLoader, setShowLoader] = useState(false);

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

    // --- TRACK BUTTON CLICK AND RELOAD ---
    // Handler for button click
    const handleButtonClick = () => {
      setShowLoader(true);
      setTimeout(() => {
        window.location.reload();
      }, 1);
    };

    // Find the button and add event listener
    const addButtonListener = () => {
      const btn = document.querySelector('button.cl-formButtonPrimary.cl-button');
      if (btn) {
        btn.addEventListener('click', handleButtonClick);
      }
    };
    // Try to add listener initially
    addButtonListener();
    // Also add listener when DOM changes (in case button appears later)
    const buttonObserver = new MutationObserver(() => {
      addButtonListener();
    });
    buttonObserver.observe(document.body, { childList: true, subtree: true });

    // --- TRACK LOCATION CHANGE TO /sign-in/factor-one ---
    let lastPath = window.location.pathname + window.location.search;
    const checkPathChange = () => {
      const currentPath = window.location.pathname + window.location.search;
      console.log('[AuthContent] Checking path:', currentPath);
      if (currentPath !== lastPath) {
        lastPath = currentPath;
        if (/^\/sign-in\/factor-one(\/?(\?.*)?)?$/.test(window.location.pathname + window.location.search)) {
          console.log('[AuthContent] Reload condition met, reloading...');
          window.location.reload();
        }
      }
    };
    const pathInterval = setInterval(checkPathChange, 200);

    // --- SHOW LOADER ON ALL OTP DIGITS FILLED (MutationObserver for value changes) ---
    let otpInputs = [];
    let otpLoaderShown = false;
    const checkOtpFilled = () => {
      otpInputs = Array.from(document.querySelectorAll('input.cl-otpCodeFieldInput.cl-input'));
      const allFilled = otpInputs.length > 0 && otpInputs.every(inp => inp.value && inp.value.length === 1);
      if (allFilled && !otpLoaderShown) {
        otpLoaderShown = true;
        setShowLoader(true);
        // Optionally, try to reload after a longer delay (comment out if Clerk auto-navigates)
        setTimeout(() => {
          if (window.location.pathname.includes('factor-one')) {
            window.location.reload();
          }
        }, 800);
      }
    };
    // Attach input/change listeners as before
    const addOtpListeners = () => {
      otpInputs.forEach(inp => {
        inp.removeEventListener('input', checkOtpFilled);
        inp.removeEventListener('change', checkOtpFilled);
      });
      otpInputs = Array.from(document.querySelectorAll('input.cl-otpCodeFieldInput.cl-input'));
      otpInputs.forEach(inp => {
        inp.addEventListener('input', checkOtpFilled);
        inp.addEventListener('change', checkOtpFilled);
      });
    };
    addOtpListeners();
    // MutationObserver for value changes
    const otpValueObserver = new MutationObserver(() => {
      checkOtpFilled();
      addOtpListeners();
    });
    otpInputs.forEach(inp => {
      otpValueObserver.observe(inp, { attributes: true, attributeFilter: ['value'] });
    });
    // Also observe DOM for new OTP fields
    const otpDomObserver = new MutationObserver(() => {
      addOtpListeners();
      checkOtpFilled();
    });
    otpDomObserver.observe(document.body, { childList: true, subtree: true });

    // Global fallback: listen for input events on document
    const globalOtpListener = (e) => {
      if (e.target && e.target.classList && e.target.classList.contains('cl-otpCodeFieldInput')) {
        checkOtpFilled();
      }
    };
    document.addEventListener('input', globalOtpListener, true);

    // Clean up observers and event listeners
    return () => {
      observer.disconnect();
      buttonObserver.disconnect();
      const btn = document.querySelector('button.cl-formButtonPrimary.cl-button');
      if (btn) {
        btn.removeEventListener('click', handleButtonClick);
      }
      clearInterval(pathInterval);
      otpValueObserver.disconnect();
      otpDomObserver.disconnect();
      otpInputs.forEach(inp => {
        inp.removeEventListener('input', checkOtpFilled);
        inp.removeEventListener('change', checkOtpFilled);
      });
      document.removeEventListener('input', globalOtpListener, true);
    };
  }, [t, currentLang]);

  if (SITE2) {
    return (
      <>
        {showLoader && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-background/80">
            <LoadingSpinner size="lg" />
          </div>
        )}
        <p className={`fz38 tac por z-10 white tracking-[1.5]`}>{t("signIn")}</p>
        <p className={`fz15 tal por l5 z-10 white`}>{t("toPowerUpYourLinks")}</p>
        <p className={`fz15 tal por l5 z-10 white`}>{t("andProtectYourBrand")}</p>
      </>
    );
  }

  return (
    <>
      {showLoader && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-background/80">
          <LoadingSpinner size="lg" />
        </div>
      )}
      <p className={`fz38 tac por z-10 white tracking-[1.5]`}>{t("signIn")}</p>
      <p className={`fz15 tal por l5 z-10 white`}>{t("toSupportYour")}</p>
      <p className={`fz15 tal por l5 z-10 white`}>{t("favoriteCreators")}</p>
    </>
  );
};

export default AuthContent;
// ? code end AuthContent 
// ? code end AuthContent 