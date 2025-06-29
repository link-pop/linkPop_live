"use client";

import { useEffect, useRef } from "react";

export default function InstagramBrowserRedirect({ redirectUrl }) {
  const linkRef = useRef(null);

  useEffect(() => {
    // Automatically trigger the link click when component mounts
    if (linkRef.current) {
      linkRef.current.click();
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="text-center">
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
