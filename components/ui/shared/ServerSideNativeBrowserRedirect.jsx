// SERVER COMPONENT: Detects in-app browsers from user-agent and redirects or renders UI
import { redirect } from "next/navigation";
import NativeBrowserRedirect from "@/app/(genMongoCol)/[col]/NativeBrowserRedirect";

// In-app browser detection logic (adapted for server-side)
function detectInAppBrowserFromUA(ua = "") {
  const inAppPattern = /FBAN|FBAV|Instagram|Line\/|MicroMessenger|Twitter|LinkedIn|Snapchat|TikTok|FBIOS|FB_IAB|FB4A/i;
  let browserName = "in-app browser";
  if (ua.includes("Instagram")) browserName = "Instagram";
  else if (/FBAN|FBAV|FBIOS|FB_IAB|FB4A/i.test(ua)) browserName = "Facebook";
  else if (ua.includes("Twitter")) browserName = "Twitter";
  else if (ua.includes("TikTok")) browserName = "TikTok";
  else if (ua.includes("LinkedIn")) browserName = "LinkedIn";
  else if (ua.includes("Snapchat")) browserName = "Snapchat";
  else if (/Line\//i.test(ua)) browserName = "LINE";
  else if (ua.includes("MicroMessenger")) browserName = "WeChat";
  return { isInAppBrowser: inAppPattern.test(ua), browserName };
}

// Server Component
export default function ServerSideNativeBrowserRedirect({ redirectUrl, userAgent }) {
  // userAgent can be passed as prop or extracted from headers in the page
  const ua = userAgent || "";
  const { isInAppBrowser } = detectInAppBrowserFromUA(ua);

  if (isInAppBrowser) {
    // Render the same UI as NativeBrowserRedirect (client comp)
    // This will hydrate on client and auto-open the link
    return <NativeBrowserRedirect redirectUrl={redirectUrl} />;
  }
  // Not in-app browser: perform server-side redirect
  redirect(redirectUrl);
  return null;
} 