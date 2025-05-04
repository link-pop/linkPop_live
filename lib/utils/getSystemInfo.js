export const getSystemType = (customUserAgent) => {
  if (typeof window === "undefined") return "";
  const ua =
    customUserAgent?.toLowerCase() || window.navigator.userAgent.toLowerCase();

  // Operating System
  let os = "Unknown";
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac")) os = "MacOS";
  else if (ua.includes("linux")) os = "Linux";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad"))
    os = "iOS";

  return os;
};

export const getSystemEmoji = (system) => {
  const systemMap = {
    Windows: "🏢",
    MacOS: "🍎",
    Linux: "🐧",
    Android: "🤖",
    iOS: "🍏",
    Unknown: "❓",
  };
  return systemMap[system] || systemMap.Unknown;
};
