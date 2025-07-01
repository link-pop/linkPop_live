// SERVER COMPONENT: Detects in-app browsers from user-agent and forces native browser redirect
import { redirect } from "next/navigation";
import ForceNativeBrowserClient from "./ForceNativeBrowserClient";

// In-app browser detection logic (adapted for server-side)
function detectInAppBrowserFromUA(ua = "") {
  const inAppPattern = /FBAN|FBAV|Instagram|Line\/|MicroMessenger|Twitter|LinkedIn|Snapchat|TikTok|FBIOS|FB_IAB|FB4A|GSA\/|CriOS|EdgiOS|OPiOS|FxiOS|DuckDuckGo/i;
  let browserName = "in-app browser";
  if (ua.includes("Instagram")) browserName = "Instagram";
  else if (/FBAN|FBAV|FBIOS|FB_IAB|FB4A/i.test(ua)) browserName = "Facebook";
  else if (ua.includes("Twitter")) browserName = "Twitter";
  else if (ua.includes("TikTok")) browserName = "TikTok";
  else if (ua.includes("LinkedIn")) browserName = "LinkedIn";
  else if (ua.includes("Snapchat")) browserName = "Snapchat";
  else if (/Line\//i.test(ua)) browserName = "LINE";
  else if (ua.includes("MicroMessenger")) browserName = "WeChat";
  else if (ua.includes("GSA/")) browserName = "Google App";
  else if (ua.includes("CriOS")) browserName = "Chrome iOS";
  else if (ua.includes("DuckDuckGo")) browserName = "DuckDuckGo";
  return { isInAppBrowser: inAppPattern.test(ua), browserName };
}

// Generate server-side meta redirects and scripts for aggressive redirection
function generateServerSideRedirectMarkup(redirectUrl, browserName) {
  // Multiple server-side redirect strategies
  const metaRefreshInstant = `<meta http-equiv="refresh" content="0;url=${redirectUrl}">`;
  const metaRefreshDelayed = `<meta http-equiv="refresh" content="1;url=${redirectUrl}">`;
  
  // Browser-specific deep link approaches
  const iosLinks = {
    instagram: `instagram://external_url?url=${encodeURIComponent(redirectUrl)}`,
    facebook: `fb://browser?url=${encodeURIComponent(redirectUrl)}`,
    twitter: `twitter://link?url=${encodeURIComponent(redirectUrl)}`,
    safari: `x-web-search://?${encodeURIComponent(redirectUrl)}`,
    chrome: `googlechrome://${redirectUrl.replace(/^https?:\/\//, '')}`,
    firefox: `firefox://open-url?url=${encodeURIComponent(redirectUrl)}`
  };

  const androidLinks = {
    instagram: `intent://${redirectUrl.replace(/^https?:\/\//, '')}#Intent;package=com.android.chrome;scheme=https;end`,
    facebook: `intent://${redirectUrl.replace(/^https?:\/\//, '')}#Intent;package=com.android.chrome;scheme=https;end`,
    twitter: `intent://${redirectUrl.replace(/^https?:\/\//, '')}#Intent;package=com.android.chrome;scheme=https;end`,
    chrome: `intent://${redirectUrl.replace(/^https?:\/\//, '')}#Intent;package=com.android.chrome;scheme=https;end`,
    samsung: `intent://${redirectUrl.replace(/^https?:\/\//, '')}#Intent;package=com.sec.android.app.sbrowser;scheme=https;end`
  };

  // Advanced JavaScript redirect script
  const redirectScript = `
    <script type="text/javascript">
      (function() {
        var redirectUrl = "${redirectUrl}";
        var browserName = "${browserName}";
        var attempts = 0;
        var maxAttempts = 10;
        
        // Immediate redirect attempt
        function immediateRedirect() {
          try {
            // Method 1: Location replace (most aggressive)
            window.location.replace(redirectUrl);
          } catch (e) {
            console.log('❌ Location replace failed:', e);
          }
        }
        
        // Multiple redirect strategies
        function executeRedirectStrategies() {
          var strategies = [
            function() { window.location.href = redirectUrl; },
            function() { window.location.assign(redirectUrl); },
            function() { document.location = redirectUrl; },
            function() { document.location.href = redirectUrl; },
            function() { top.location.href = redirectUrl; },
            function() { parent.location.href = redirectUrl; },
            function() { window.open(redirectUrl, '_self'); },
            function() { window.open(redirectUrl, '_top'); },
            function() { window.open(redirectUrl, '_parent'); }
          ];
          
          strategies.forEach(function(strategy, index) {
            setTimeout(function() {
              try {
                strategy();
              } catch (e) {
                console.log('❌ Strategy ' + (index + 1) + ' failed:', e);
              }
            }, index * 100);
          });
        }
        
        // Platform-specific deep links
        function tryDeepLinks() {
          var userAgent = navigator.userAgent || '';
          var isIOS = /iPad|iPhone|iPod/.test(userAgent);
          var isAndroid = /Android/.test(userAgent);
          
          if (isIOS) {
            // iOS deep link attempts
            var iosAttempts = [
              "${iosLinks.safari}",
              "${iosLinks.chrome}",
              "${iosLinks.firefox}",
              "x-web-search://?${encodeURIComponent(redirectUrl)}"
            ];
            
            iosAttempts.forEach(function(link, index) {
              setTimeout(function() {
                try {
                  window.location.href = link;
                } catch (e) {
                  console.log('❌ iOS deep link ' + (index + 1) + ' failed:', e);
                }
              }, index * 200);
            });
          }
          
          if (isAndroid) {
            // Android intent attempts
            var androidAttempts = [
              "${androidLinks.chrome}",
              "${androidLinks.samsung}",
              "intent://${redirectUrl.replace(/^https?:\/\//, '')}#Intent;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.android.browser;end"
            ];
            
            androidAttempts.forEach(function(link, index) {
              setTimeout(function() {
                try {
                  window.location.href = link;
                } catch (e) {
                  console.log('❌ Android intent ' + (index + 1) + ' failed:', e);
                }
              }, index * 200);
            });
          }
        }
        
        // Persistent redirect loop
        function persistentRedirect() {
          if (attempts < maxAttempts) {
            attempts++;
            try {
              window.location.replace(redirectUrl);
            } catch (e) {
              setTimeout(persistentRedirect, 500);
            }
          }
        }
        
        // Execute all strategies
        immediateRedirect();
        setTimeout(executeRedirectStrategies, 50);
        setTimeout(tryDeepLinks, 300);
        setTimeout(persistentRedirect, 1000);
        
        // Fallback for stubborn browsers
        setInterval(function() {
          try {
            window.location.replace(redirectUrl);
          } catch (e) {
            console.log('❌ Interval redirect failed:', e);
          }
        }, 2000);
        
      })();
    </script>
  `;

  // Server-side redirect HTML page
  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${metaRefreshInstant}
      ${metaRefreshDelayed}
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redirecting...</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex; 
          justify-content: center; 
          align-items: center; 
          min-height: 100vh; 
          margin: 0; 
          background: #f5f5f5;
          color: #333;
        }
        .container { 
          text-align: center; 
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          max-width: 400px;
        }
        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .link {
          color: #007bff;
          text-decoration: none;
          word-break: break-all;
          font-size: 0.9rem;
        }
        .manual-link {
          display: inline-block;
          margin-top: 1rem;
          padding: 0.8rem 1.5rem;
          background: #007bff;
          color: white;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
        }
      </style>
      ${redirectScript}
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
        <h2>Redirecting to Browser...</h2>
        <p>Opening in your native browser for the best experience.</p>
        <p>Detected: <strong>${browserName}</strong></p>
        <p>If you're not redirected automatically:</p>
        <a href="${redirectUrl}" class="manual-link" target="_blank" rel="noopener noreferrer">
          Open in Browser
        </a>
        <br><br>
        <a href="${redirectUrl}" class="link" target="_blank" rel="noopener noreferrer">
          ${redirectUrl}
        </a>
      </div>
    </body>
    </html>
  `;
}

// Server Component
export default function ServerSideNativeBrowserRedirect({ redirectUrl, userAgent }) {
  // userAgent can be passed as prop or extracted from headers in the page
  const ua = userAgent || "";
  const { isInAppBrowser, browserName } = detectInAppBrowserFromUA(ua);

  if (isInAppBrowser) {
    // For in-app browsers, try aggressive server-side redirect first
    const serverRedirectMarkup = generateServerSideRedirectMarkup(redirectUrl, browserName);
    
    return (
      <>
        {/* Server-side aggressive redirect HTML injection */}
        <div 
          dangerouslySetInnerHTML={{ 
            __html: serverRedirectMarkup 
          }} 
        />
        
        {/* Fallback client-side component if server redirects fail */}
        <div style={{ display: 'none' }}>
          <ForceNativeBrowserClient redirectUrl={redirectUrl} browserName={browserName} />
        </div>
      </>
    );
  }
  
  // Not in-app browser: perform server-side redirect
  redirect(redirectUrl);
  return null;
} 