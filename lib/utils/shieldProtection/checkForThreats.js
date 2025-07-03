/**
 * Check if visitor is potentially a bot, crawler, or threat
 * @param {string} userAgent - User agent string
 * @param {Object} geoData - Geo location data object
 * @param {string} referrer - Referrer URL
 * @returns {boolean} - True if visitor is flagged as a potential threat
 */
export function checkForThreats(userAgent, geoData, referrer) {
  // Check user agent for common bot signatures
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /google/i,
    /baidu/i,
    /bing/i,
    /yahoo/i,
    /facebook/i,
    /instagram/i,
    /moderator/i,
    /monitor/i,
    /scraper/i,
    /headless/i,
    /archive/i,
    /semrush/i,
    /ahrefs/i,
    /yandex/i,
    /lighthouse/i,
    /slurp/i,
    /phantom/i,
    /selenium/i,
    /puppeteer/i,
    /httrack/i,
    /wget/i,
    /curl/i,
    /python-requests/i,
    /twitterbot/i,
    /whatsapp/i,
    /telegram/i,
    /screaming frog/i,
    /sitechecker/i,
    /proximic/i,
    /mediapartners/i,
    /applebot/i,
    /duckduckbot/i,
    /bingpreview/i,
    /facebookexternalhit/i,
    /scanner/i,
    /inspect/i,
    /audit/i,
  ];

  const isUserAgentSuspicious = botPatterns.some((pattern) =>
    pattern.test(userAgent || "")
  );

  // Check for proxy, VPN or hosting indicators
  const isProxyOrHosting = !!(geoData?.proxy || geoData?.hosting);

  // Flag visitor if any of these conditions are true
  return isUserAgentSuspicious || isProxyOrHosting;
}
