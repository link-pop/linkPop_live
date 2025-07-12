function generateUUID() {
  if (window.crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  let d = new Date().getTime();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function isMobile() {
  return /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(
    navigator.userAgent
  );
}

function isInApp() {
  return /(iPhone|iPad|iPod).*Safari/.test(navigator.userAgent) === false;
}

function isIOS() {
  return /(iPhone|iPod|iPad)/i.test(navigator.userAgent);
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function goToURL() {
  const adzSid = getCookie("adz_sid");
  const targetURL = new URL(window.location.href);
  targetURL.searchParams.set("adz_sid", adzSid || "");
  targetURL.searchParams.set("utm_term", "inappredirect");
  window.location.href = targetURL.toString();
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length > 1 ? parts.pop().split(";").shift() : null;
}

function handleRedirect() {
  const platform = detectPlatform();

  if (!isMobile()) return;

  const sessionId = sessionStorage.getItem("sessionId") || generateUUID();
  sessionStorage.setItem("sessionId", sessionId);

  if (
    (isIOS() && platform === "ios") ||
    (isAndroid() && platform === "android")
  ) {
    setTimeout(goToURL, 500); // example delay
  }
}

function detectPlatform() {
  return isIOS() ? "ios" : isAndroid() ? "android" : "web";
}
