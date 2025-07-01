"use client";

import { useEffect, useRef } from "react";

// Client Component for aggressive native browser forcing
export default function ForceNativeBrowserClient({ redirectUrl, browserName }) {
  const linkRef = useRef(null);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    // Method 1: Immediate attempt
    setTimeout(() => {
      try {
        window.open(redirectUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.log('❌ Initial window.open failed:', e);
      }
    }, 100);

    // Method 2: Multiple fallback attempts with different intervals
    const methods = [
      () => window.open(redirectUrl, '_blank', 'noopener,noreferrer,popup=1'),
      () => window.open(redirectUrl, '_system'),
      () => window.location.assign(redirectUrl),
      () => window.location.href = redirectUrl,
      () => window.location.replace(redirectUrl),
      () => document.location = redirectUrl,
      () => {
        // Create temporary link and click it
        const tempLink = document.createElement('a');
        tempLink.href = redirectUrl;
        tempLink.target = '_blank';
        tempLink.rel = 'noopener noreferrer external';
        tempLink.click();
      },
      () => {
        // Try with iframe approach
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = redirectUrl;
        document.body.appendChild(iframe);
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch (e) {
            console.log('❌ Iframe cleanup failed:', e);
          }
        }, 2000);
      }
    ];

    methods.forEach((method, index) => {
      setTimeout(() => {
        try {
          method();
        } catch (e) {
          console.log(`❌ Method ${index + 1} failed:`, e);
        }
      }, (index + 1) * 600);
    });

    // Continuous attempts for stubborn in-app browsers
    const persistentInterval = setInterval(() => {
      try {
        if (linkRef.current) {
          linkRef.current.click();
        }
        window.open(redirectUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.log('❌ Persistent attempt failed:', e);
      }
    }, 2000);

    // Clean up after 30 seconds
    setTimeout(() => {
      clearInterval(persistentInterval);
    }, 30000);

    return () => {
      clearInterval(persistentInterval);
    };
  }, [redirectUrl]);

  const handleManualClick = () => {
    // Execute multiple methods simultaneously
    const promises = [
      () => window.open(redirectUrl, '_blank', 'noopener,noreferrer'),
      () => window.open(redirectUrl, '_system'),
      () => {
        setTimeout(() => window.location.assign(redirectUrl), 100);
      },
      () => {
        setTimeout(() => window.location.href = redirectUrl, 300);
      },
      () => {
        setTimeout(() => window.location.replace(redirectUrl), 500);
      }
    ];

    promises.forEach((fn, index) => {
      try {
        fn();
      } catch (e) {
        console.log(`❌ Manual method ${index + 1} failed:`, e);
      }
    });
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(redirectUrl).then(() => {
        alert('Link copied! Please paste it in your browser app.');
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = redirectUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Link copied! Please paste it in your browser app.');
      });
    } catch (e) {
      console.log('❌ Copy failed:', e);
      alert(`Please copy this link manually: ${redirectUrl}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Open in Browser</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Please open this link in your device's native browser for the best experience
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Primary method: Aggressive link */}
          <a
            ref={linkRef}
            href={redirectUrl}
            target="_blank"
            rel="noopener noreferrer external"
            className="block w-full rounded-md bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={handleManualClick}
          >
            Open in Browser
          </a>
          
          {/* Fallback: Copy link */}
          <button
            onClick={handleCopyLink}
            className="block w-full rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Copy Link
          </button>

          {/* Manual instructions */}
          <div className="text-xs text-muted-foreground p-3 border rounded-md bg-muted/50">
            <p className="font-medium mb-1">If link doesn't open:</p>
            <ol className="text-left space-y-1">
              <li>1. Copy the link above</li>
              <li>2. Open your device's browser app</li>
              <li>3. Paste the link in the address bar</li>
            </ol>
          </div>
        </div>
        
        <div className="mt-6 text-xs text-muted-foreground">
          <p>Currently in: {browserName}</p>
          <p className="mt-1 font-mono text-xs break-all opacity-60">
            {redirectUrl}
          </p>
        </div>
      </div>
      
      {/* Enhanced auto-redirect script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var redirectUrl = '${redirectUrl}';
              var attempts = 0;
              var maxAttempts = 8;
              
              // Immediate attempts with different methods
              setTimeout(function() {
                try {
                  window.open(redirectUrl, '_blank', 'noopener,noreferrer');
                } catch (e) {}
              }, 50);
              
              setTimeout(function() {
                try {
                  window.open(redirectUrl, '_system');
                } catch (e) {}
              }, 150);
              
              // Progressive fallback attempts
              var interval = setInterval(function() {
                attempts++;
                
                try {
                  if (attempts === 1) {
                    window.open(redirectUrl, '_blank', 'noopener,noreferrer,popup=1');
                  } else if (attempts === 2) {
                    window.location.assign(redirectUrl);
                  } else if (attempts === 3) {
                    window.location.href = redirectUrl;
                  } else if (attempts === 4) {
                    window.location.replace(redirectUrl);
                  } else if (attempts === 5) {
                    document.location = redirectUrl;
                  } else if (attempts === 6) {
                    // Create and click temporary link
                    var tempLink = document.createElement('a');
                    tempLink.href = redirectUrl;
                    tempLink.target = '_blank';
                    tempLink.rel = 'noopener noreferrer external';
                    document.body.appendChild(tempLink);
                    tempLink.click();
                    document.body.removeChild(tempLink);
                  } else if (attempts === 7) {
                    // Force focus and try again
                    window.focus();
                    window.open(redirectUrl, '_blank', 'noopener,noreferrer');
                  } else if (attempts === 8) {
                    // Final desperate attempt
                    top.location = redirectUrl;
                  }
                } catch (e) {
                  console.log('❌ Auto-redirect attempt ' + attempts + ' failed:', e);
                }
                
                if (attempts >= maxAttempts) {
                  clearInterval(interval);
                }
              }, 1000);
              
              // Persistent clicking of the main link
              var clickInterval = setInterval(function() {
                var mainLink = document.querySelector('a[href="' + redirectUrl + '"]');
                if (mainLink) {
                  try {
                    mainLink.click();
                  } catch (e) {}
                }
              }, 3000);
              
              // Stop persistent clicking after 45 seconds
              setTimeout(function() {
                clearInterval(clickInterval);
              }, 45000);
            })();
          `
        }}
      />
    </div>
  );
} 