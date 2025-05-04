/**
 * Debug configuration utilities
 * Used to toggle debugging features without redeploying the app
 */

// Default configuration
let debugConfig = {
  enableGeoLogging: false,
  logHeaders: false,
  logIPs: false,
  // Add new debugging flags here as needed
};

/**
 * Retrieves debug configuration values based on environment variables or defaults
 * This allows enabling debug features in production via environment variables
 * without needing to redeploy
 */
export function getDebugConfig() {
  try {
    // Override with environment variables if set
    if (typeof process !== "undefined" && process.env) {
      // Check for environment variable overrides
      if (process.env.DEBUG_GEO === "true") {
        debugConfig.enableGeoLogging = true;
      }
      if (process.env.DEBUG_HEADERS === "true") {
        debugConfig.logHeaders = true;
      }
      if (process.env.DEBUG_IPS === "true") {
        debugConfig.logIPs = true;
      }
    }

    return debugConfig;
  } catch (error) {
    console.error("Error getting debug config:", error);
    return debugConfig; // Return default config on error
  }
}

/**
 * Conditionally logs debug information only if the specific debug feature is enabled
 * @param {string} type - The type of debugging (e.g., 'geo', 'headers', 'ip')
 * @param {string} message - The message to log
 * @param {any} data - Additional data to log
 */
export function debugLog(type, message, data = null) {
  const config = getDebugConfig();

  let shouldLog = false;

  // Determine if we should log based on type
  switch (type.toLowerCase()) {
    case "geo":
      shouldLog = config.enableGeoLogging;
      break;
    case "headers":
      shouldLog = config.logHeaders;
      break;
    case "ip":
      shouldLog = config.logIPs;
      break;
    default:
      shouldLog = false;
  }

  // Log the message if debugging is enabled for this type
  if (shouldLog) {
    if (data) {
      console.log(`[DEBUG:${type.toUpperCase()}] ${message}`, data);
    } else {
      console.log(`[DEBUG:${type.toUpperCase()}] ${message}`);
    }
  }
}
