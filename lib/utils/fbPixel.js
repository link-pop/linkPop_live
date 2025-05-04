"use client";

import Script from "next/script";
import { useState, useEffect } from "react";

/**
 * Initializes Facebook Pixel in the client
 * @param {string} pixelId - The Facebook Pixel ID to initialize
 * @returns {boolean} - Whether the pixel was successfully loaded
 */
export function useFacebookPixel(pixelId) {
  const [fbPixelLoaded, setFbPixelLoaded] = useState(false);

  useEffect(() => {
    if (!pixelId || fbPixelLoaded) return;

    // Define the Facebook Pixel initialization code
    const initPixel = () => {
      if (window.fbq) return;

      window.fbq = function () {
        window.fbq.callMethod
          ? window.fbq.callMethod.apply(window.fbq, arguments)
          : window.fbq.queue.push(arguments);
      };

      if (!window._fbq) window._fbq = window.fbq;
      window.fbq.push = window.fbq;
      window.fbq.loaded = true;
      window.fbq.version = "2.0";
      window.fbq.queue = [];

      window.fbq("init", pixelId);
      window.fbq("track", "PageView");

      console.log(`Facebook Pixel initialized with ID: ${pixelId}`);
      setFbPixelLoaded(true);
    };

    // Initialize the pixel
    initPixel();
  }, [pixelId, fbPixelLoaded]);

  return fbPixelLoaded;
}

/**
 * Track a custom Facebook Pixel event
 * @param {string} eventName - Name of the event to track
 * @param {object} params - Optional parameters for the event
 */
export function trackFbPixelEvent(eventName, params = {}) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, params);
    console.log(`Facebook Pixel event tracked: ${eventName}`, params);
    return true;
  }
  return false;
}

/**
 * Facebook Pixel Script Component
 * @param {object} props - Component props
 * @param {string} props.pixelId - The Facebook Pixel ID to load
 * @returns {React.Component} - The Facebook Pixel script component
 */
export function FacebookPixelScript({ pixelId }) {
  if (!pixelId) return null;

  return (
    <>
      <Script
        id={`fb-pixel-${pixelId}`}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
