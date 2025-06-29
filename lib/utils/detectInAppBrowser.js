/**
 * Detects if the current browser is an in-app browser and returns browser information
 * @returns {Object} - { isInAppBrowser: boolean, browserName: string }
 */
export function detectInAppBrowser() {
  if (typeof window === "undefined") {
    return { isInAppBrowser: false, browserName: "unknown" };
  }

  const ua = navigator.userAgent || navigator.vendor || window.opera;

  // Check for various in-app browsers
  const isInAppBrowser =
    /FBAN|FBAV|Instagram|Line\/|MicroMessenger|Twitter|LinkedIn|Snapchat|TikTok|FBIOS|FB_IAB|FB4A/i.test(
      ua
    );

  let browserName = "in-app browser";

  if (ua.includes("Instagram")) {
    browserName = "Instagram";
  } else if (/FBAN|FBAV|FBIOS|FB_IAB|FB4A/i.test(ua)) {
    browserName = "Facebook";
  } else if (ua.includes("Twitter")) {
    browserName = "Twitter";
  } else if (ua.includes("TikTok")) {
    browserName = "TikTok";
  } else if (ua.includes("LinkedIn")) {
    browserName = "LinkedIn";
  } else if (ua.includes("Snapchat")) {
    browserName = "Snapchat";
  } else if (/Line\//i.test(ua)) {
    browserName = "LINE";
  } else if (ua.includes("MicroMessenger")) {
    browserName = "WeChat";
  }

  return { isInAppBrowser, browserName };
}
