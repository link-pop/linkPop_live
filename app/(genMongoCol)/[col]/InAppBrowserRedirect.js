"use client";

import { useState, useEffect } from "react";
import { detectInAppBrowser } from "@/lib/utils/detectInAppBrowser";

export default function InAppBrowserRedirect({ redirectUrl }) {
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [browserName, setBrowserName] = useState("Instagram");

  useEffect(() => {
    // Detect which in-app browser for better messaging
    const { browserName: detectedBrowser } = detectInAppBrowser();
    setBrowserName(detectedBrowser);
  }, []);

  const handleOpenInBrowser = () => {
    setHasUserInteracted(true);

    // This is the key trick - window.open with _blank after user interaction
    // This should trigger the native browser (Safari on iOS)
    const newWindow = window.open(redirectUrl, "_blank");

    // If the window opens successfully, we can try to close this window
    if (newWindow) {
      newWindow.opener = null; // Security measure

      // Optional: Try to redirect current window as fallback after short delay
      setTimeout(() => {
        if (!newWindow.closed) {
          // If the new window is still open, redirect current window too
          window.location.href = redirectUrl;
        }
      }, 1000);
    } else {
      // If window.open failed (popup blocked), fallback to location.href
      window.location.href = redirectUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4">
      <div className="bg-accent text-foreground rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3">
            Open in {browserName === "Instagram" ? "Safari" : "Browser"}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            You're currently using the {browserName} in-app browser. For the
            best experience, please open this link in your device's native
            browser.
          </p>
        </div>

        <button
          onClick={handleOpenInBrowser}
          className="w-full bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-md hover:bg-primary/90 transition-colors mb-4"
        >
          Tap to Continue in{" "}
          {browserName === "Instagram" ? "Safari" : "Browser"}
        </button>

        <div className="text-xs text-muted-foreground">
          <p className="mb-2">
            If nothing happens after tapping the button above:
          </p>
          <div className="text-left space-y-1">
            <p>• Tap and hold the button, then select "Open in browser"</p>
            <p>• Use the menu (⋮ or ...) and select "Open in browser"</p>
            <p>• Copy the link and paste it in Safari/Chrome</p>
          </div>
        </div>

        {hasUserInteracted && (
          <div className="mt-4 p-3 bg-muted rounded text-xs">
            If the page didn't open in your browser, you may need to manually
            copy and paste the link.
          </div>
        )}
      </div>
    </div>
  );
}
