export function getBrowserType(customUserAgent) {
  if (typeof window === "undefined") return "";

  const ua =
    customUserAgent?.toLowerCase() || window.navigator.userAgent.toLowerCase();

  // Chrome
  if (ua.includes("chrome") && !ua.includes("edg") && !ua.includes("opr")) {
    return "Chrome";
  }
  // Edge
  if (ua.includes("edg")) {
    return "Edge";
  }
  // Firefox
  if (ua.includes("firefox")) {
    return "Firefox";
  }
  // Safari
  if (ua.includes("safari") && !ua.includes("chrome")) {
    return "Safari";
  }
  // Opera
  if (ua.includes("opr") || ua.includes("opera")) {
    return "Opera";
  }
  // Samsung Browser
  if (ua.includes("samsungbrowser")) {
    return "Samsung Browser";
  }

  return "Other";
}

export function getBrowserEmoji(type) {
  switch (type) {
    case "Chrome":
      return "💿";
    case "Firefox":
      return "🦊";
    case "Safari":
      return "🧭";
    case "Edge":
      return "📐";
    case "Opera":
      return "🎭";
    case "Samsung Browser":
      return "🌌";
    default:
      return "🤔";
  }
}
