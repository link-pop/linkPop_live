export function getPlatformType() {
  if (typeof window === "undefined") return "";

  const ua = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();
  const vendor = navigator.vendor?.toLowerCase() || "";

  // Mobile detection first - more comprehensive checks
  if (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua) ||
    (typeof window.orientation !== "undefined") ||
    navigator.maxTouchPoints > 0
  ) {
    // Tablet specific detection
    if (
      /(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua) ||
      (navigator.maxTouchPoints > 0 && Math.min(window.screen.width, window.screen.height) > 750)
    ) {
      return "tablet";
    }
    return "mobile";
  }

  // TV detection
  if (
    /smart-tv|smarttv|smart tv|netcast|tv store|webos.+tv|web0s.+tv/i.test(ua) ||
    /lg.+tv|samsung.+tv|hbb.?tv|dtv|philips.+tv|opera.+tv|tv.+safari|tv.+chrome/i.test(ua)
  ) {
    return "tv";
  }

  // Desktop/Laptop detection
  const isDesktopPlatform = /win|mac|linux/i.test(platform);
  if (!isDesktopPlatform) return "unknown";

  // More accurate laptop detection
  const hasBattery = "getBattery" in navigator;
  const hasTouch = navigator.maxTouchPoints > 0;
  
  if (hasBattery || hasTouch) {
    return "laptop";
  }

  return "desktop";
}

export function getPlatformEmoji(type) {
  const emojis = {
    desktop: "🖥️",
    laptop: "💻",
    mobile: "📱",
    tablet: "💊",
    tv: "📺",
    smartwatch: "⌚",
    unknown: "❓"
  };

  return emojis[type] || emojis.unknown;
}
