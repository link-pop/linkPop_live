import { headers } from "next/headers";

/**
 * Extracts the client IP address from various HTTP headers
 * Includes support for common proxy and CDN headers
 * @returns {string} The client IP address or a fallback value if not found
 */
export function getClientIP() {
  const headersList = headers();
  let ip = null;

  // If we're in a development environment, we want to check if a test IP is requested via a header
  // This allows us to test different regions
  if (process.env.NODE_ENV === "development") {
    // Get the specific test location from headers, if any
    const testRegion = headersList.get("x-test-region");
    if (testRegion) {
      // Special IP for testing that's always treated as from the specified region
      if (testRegion.toLowerCase() === "cherkaska") {
        return "test-cherkaska";
      }
      // Default to Kyiv
      return "test-kyiv";
    }
  }

  // Log all headers in debug mode (if NEXT_PUBLIC_DEBUG_HEADERS is set)
  if (process.env.NEXT_PUBLIC_DEBUG_HEADERS === "true") {
    console.log("All available headers:");
    headersList.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
  }

  // Try to get IP from headers in order of reliability

  // 1. Specific CDN headers
  // Cloudflare
  const cfConnectingIP = headersList.get("cf-connecting-ip");
  if (cfConnectingIP) {
    console.log("IP from cf-connecting-ip:", cfConnectingIP);
    return cfConnectingIP.trim();
  }

  // Vercel
  const vercelIP =
    headersList.get("x-vercel-forwarded-for") || headersList.get("x-vercel-ip");
  if (vercelIP) {
    const cleanIP = vercelIP.split(",")[0].trim();
    console.log("IP from Vercel headers:", cleanIP);
    return cleanIP;
  }

  // 2. Standard proxy headers
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    const cleanIP = forwardedFor.split(",")[0].trim();
    console.log("IP from x-forwarded-for:", cleanIP);
    return cleanIP;
  }

  const realIP = headersList.get("x-real-ip");
  if (realIP) {
    console.log("IP from x-real-ip:", realIP);
    return realIP.trim();
  }

  // 3. True client IP (used by some CDNs)
  const trueClientIP = headersList.get("true-client-ip");
  if (trueClientIP) {
    console.log("IP from true-client-ip:", trueClientIP);
    return trueClientIP.trim();
  }

  // 4. Other possible headers
  const possibleHeaders = [
    "forwarded",
    "x-client-ip",
    "x-forwarded",
    "fastly-client-ip",
    "x-cluster-client-ip",
    "x-forwarded-host",
  ];

  for (const header of possibleHeaders) {
    const value = headersList.get(header);
    if (value) {
      const cleanIP = value.split(",")[0].trim();
      console.log(`IP from ${header}:`, cleanIP);
      return cleanIP;
    }
  }

  // In development, use Kyiv by default
  if (process.env.NODE_ENV === "development") {
    console.log("Using development default IP: test-kyiv");
    return "test-kyiv";
  }

  // Fallback to localhost if no IP was found
  console.log("No IP found, falling back to 127.0.0.1");
  return "127.0.0.1";
}
