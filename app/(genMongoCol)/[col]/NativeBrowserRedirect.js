"use client";

import { useEffect, useRef } from "react";
import { detectInAppBrowser } from "@/lib/utils/detectInAppBrowser";

export default function NativeBrowserRedirect({ redirectUrl }) {
  const linkRef = useRef(null);
  const { browserName } = detectInAppBrowser();

  useEffect(() => {
    // Create an interval to trigger the link click every 300ms
    const interval = setInterval(() => {
      if (linkRef.current) {
        linkRef.current.click();
      }
    }, 300);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          Opening in {browserName}
        </p>
        <a
          ref={linkRef}
          href={redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="inline-block rounded-md bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground"
        >
          Open Link
        </a>
      </div>
    </div>
  );
}
