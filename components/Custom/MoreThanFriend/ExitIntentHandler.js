"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useContext } from "@/components/Context/Context";

export default function ExitIntentHandler() {
  const searchParams = useSearchParams();
  const { dialogSet } = useContext();

  useEffect(() => {
    const fromDirectlink = searchParams.get("fromDirectlink") === "true";
    const freeUrl = searchParams.get("FU");

    if (!fromDirectlink || !freeUrl) return;

    sessionStorage.setItem("fromDirectlink", "true");
    sessionStorage.setItem("freeUrl", freeUrl);

    const linkId = searchParams.get("linkId");
    if (linkId) {
      sessionStorage.setItem("linkId", linkId);
    }

    let exitIntentTriggered = false;
    let confirmBtnEnabled = false;
    let confirmBtnTimeout = null;

    // Helper: Lock background interaction when dialog is open
    const lockBackground = () =>
      document.body.classList.add("exit-intent-lock");
    const unlockBackground = () =>
      document.body.classList.remove("exit-intent-lock");

    // Helper: Show exit dialog with confirm button disabled for 2s
    const showExitDialog = (title, text, confirmBtnText, action) => {
      lockBackground();
      confirmBtnEnabled = false;
      if (confirmBtnTimeout) clearTimeout(confirmBtnTimeout);
      dialogSet({
        isOpen: true,
        title,
        text,
        hasCloseIcon: false, // Remove close icon
        confirmBtnText,
        action: () => {
          if (!confirmBtnEnabled) return;
          unlockBackground();
          action();
        },
        confirmBtnDisabled: true, // Custom prop for your Button2/dialog impl
      });
      // Enable confirm after 2s
      confirmBtnTimeout = setTimeout(() => {
        confirmBtnEnabled = true;
        dialogSet((d) => ({ ...d, confirmBtnDisabled: false }));
      }, 2000);
    };

    const redirectUser = () => {
      if (exitIntentTriggered) return;
      exitIntentTriggered = true;
      const storedFreeUrl = sessionStorage.getItem("freeUrl");
      if (!storedFreeUrl) return;
      showExitDialog(
        "🔥 WAIT! Don't leave yet!",
        "Grab this FREE offer before you go! 🎁",
        "Get Free Offer",
        () => {
          // Open the URL without clearing sessionStorage
          window.open(decodeURIComponent(storedFreeUrl), "_blank");
          // Allow dialog to be closed
          dialogSet((d) => ({ ...d, isOpen: false }));
          // Reset exitIntentTriggered after a short delay to allow showing the dialog again
          setTimeout(() => {
            exitIntentTriggered = false;
          }, 500);
        }
      );
    };

    // 1️⃣ **Prevent Back Button Exit (Locks User In)**
    window.history.pushState(null, "", window.location.href);
    const handleBackButton = () => {
      window.history.pushState(null, "", window.location.href);
      if (exitIntentTriggered) return;
      exitIntentTriggered = true;
      const storedFreeUrl = sessionStorage.getItem("freeUrl");
      if (!storedFreeUrl) return;
      showExitDialog(
        "🚨 STOP! Don't leave yet!",
        "Check this out first before you go! 🎁",
        "See Offer",
        () => {
          // Open the URL without clearing sessionStorage
          window.open(decodeURIComponent(storedFreeUrl), "_blank");
          // Allow dialog to be closed
          dialogSet((d) => ({ ...d, isOpen: false }));
          // Reset exitIntentTriggered after a short delay to allow showing the dialog again
          setTimeout(() => {
            exitIntentTriggered = false;
          }, 500);
        }
      );
    };

    // 2️⃣ **Detect Exit on Desktop (Mouse Leaves the Page)**
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !exitIntentTriggered) {
        redirectUser();
      }
    };

    // 3️⃣ **Detect Scroll Up on Mobile & Desktop**
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY < lastScrollY - 50 && !exitIntentTriggered) {
        redirectUser();
      }
      lastScrollY = window.scrollY;
    };

    // 4️⃣ **Block Page Close / Tab Close**
    // NOTE: On mobile browsers, this will only show the native browser dialog (not your custom dialog),
    // and sometimes not even that. This is a browser limitation and cannot be bypassed.
    const handleBeforeUnload = (e) => {
      if (exitIntentTriggered) return;
      exitIntentTriggered = true;
      // This will show the browser's native warning dialog (if allowed by browser)
      e.preventDefault();
      e.returnValue = "⚠️ WAIT! Don't leave yet! Check this offer!";
      return "⚠️ WAIT! Don't leave yet! Check this offer!";
    };

    // 5️⃣ **Detect App Switch on Mobile (User Leaves Tab)**
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !exitIntentTriggered) {
        console.log("📲 User left the tab. Triggering exit intent...");
        redirectUser();
      }
    };

    // Attach all event listeners
    window.addEventListener("popstate", handleBackButton);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      unlockBackground();
      if (confirmBtnTimeout) clearTimeout(confirmBtnTimeout);
    };
  }, [searchParams, dialogSet]);

  return null;
}
