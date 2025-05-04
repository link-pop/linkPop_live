import { headers } from "next/headers";

/**
 * Extracts visitor information from HTTP headers including user agent and referrer
 * @returns {Object} Object containing userAgent and referrer information
 */
export function getVisitInfo() {
  const headersList = headers();
  const userAgent = headersList.get("user-agent") || "Unknown";
  const referrer = headersList.get("referer") || "Direct";

  return { userAgent, referrer };
}
