/**
 * Check if visitor is potentially a bot, crawler, or threat
 * @param {string} userAgent - User agent string
 * @param {Object} threatData - Additional threat detection data
 * @param {string} referrer - Request referrer
 * @returns {boolean} - True if visitor is flagged as a potential threat
 */
export function checkForThreats(userAgent, threatData = {}, referrer = "") {
  // Known malicious bot patterns
  const maliciousBotPatterns = [
    /crawler/i,
    /spider/i,
    /scraper/i,
    /headless/i,
    /phantom/i,
    /selenium/i,
    /puppeteer/i,
    /httrack/i,
    /wget/i,
    /curl/i,
    /python-requests/i,
    /screaming frog/i,
    /sitechecker/i,
    /proximic/i,
    /scanner/i,
  ];

  // Legitimate bot patterns (don't block these)
  const legitimateBotPatterns = [
    /googlebot/i,
    /bingbot/i,
    /yandexbot/i,
    /duckduckbot/i,
    /applebot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
  ];

  // Check if it's a legitimate bot
  if (legitimateBotPatterns.some((pattern) => pattern.test(userAgent || ""))) {
    return false;
  }

  // Check for malicious bots
  const isMaliciousBot = maliciousBotPatterns.some((pattern) =>
    pattern.test(userAgent || "")
  );

  // Check for suspicious infrastructure
  const isDatacenter = threatData?.hosting === true;
  const isProxy = threatData?.proxy === true;

  // If it's a malicious bot pattern, block it
  if (isMaliciousBot) {
    return true;
  }

  // If it's both a proxy and a datacenter, it's likely a threat
  if (isProxy && isDatacenter) {
    return true;
  }

  // Not detected as a threat
  return false;
}
