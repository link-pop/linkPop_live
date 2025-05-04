import { NextResponse } from "next/server";
import { getClientIP } from "@/lib/utils/visitor/getClientIP";
import { headers } from "next/headers";

// TODO !!!!!!!! can delete this route after testing!
/**
 * Debug endpoint to test geo filter matching against a state_code
 */
export async function GET(request) {
  // Get URL parameters
  const { searchParams } = new URL(request.url);

  // Get search parameters with defaults
  const mode = searchParams.get("mode") || "block";
  const testStateCode = searchParams.get("state_code") || "53"; // Default Poltavska oblast
  const testCountryCode = searchParams.get("country_code") || "UA"; // Default Ukraine

  // Get headers to analyze
  const headersList = headers();
  const headersObj = {};
  headersList.forEach((value, key) => {
    headersObj[key] = value;
  });

  // Get client IP for reference
  const clientIP = getClientIP();

  // Extract relevant headers from Vercel
  const vercelCountryCode = headersObj["x-vercel-ip-country"] || null;
  const vercelRegionCode = headersObj["x-vercel-ip-country-region"] || null;
  const vercelCity = headersObj["x-vercel-ip-city"] || null;

  // Check if this would match
  const countryMatches = vercelCountryCode === testCountryCode;
  const stateMatches = vercelRegionCode === testStateCode;
  const locationMatches = countryMatches && stateMatches;

  // Determine if access would be blocked
  const wouldBeBlocked =
    mode === "block"
      ? locationMatches // Block mode: block if location matches
      : !locationMatches; // Allow mode: block if location doesn't match

  // Get info about the regions for display
  const regionInfo = {
    53: "Poltavska oblast",
    30: "Kyiv",
    32: "Kyivska oblast",
    63: "Kharkivska oblast",
    46: "Lvivska oblast",
    51: "Odeska oblast",
    12: "Dnipropetrovska oblast",
    14: "Donetska oblast",
    23: "Zaporizka oblast",
  };

  // Provide examples of how to modify the test
  const exampleLinks = [
    {
      description: "Test Poltava (Ukraine)",
      url: `/api/debug/geofilter?country_code=UA&state_code=53&mode=block`,
    },
    {
      description: "Test Kyiv City",
      url: `/api/debug/geofilter?country_code=UA&state_code=30&mode=block`,
    },
    {
      description: "Test Kyiv Oblast",
      url: `/api/debug/geofilter?country_code=UA&state_code=32&mode=block`,
    },
    {
      description: "Test Allow mode (only allows Kyiv)",
      url: `/api/debug/geofilter?country_code=UA&state_code=30&mode=allow`,
    },
  ];

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    your_ip: clientIP,
    test_info: {
      visitor: {
        country_code: vercelCountryCode,
        state_code: vercelRegionCode,
        city: vercelCity,
      },
      filter: {
        mode: mode,
        locations: [
          {
            country_code: testCountryCode,
            state_code: testStateCode,
            state_name: regionInfo[testStateCode] || "Unknown region",
          },
        ],
      },
      matching: {
        country_matches: countryMatches,
        state_matches: stateMatches,
        location_matches: locationMatches,
        would_be_blocked: wouldBeBlocked,
      },
    },
    explanation: wouldBeBlocked
      ? `Access would be ${
          mode === "block"
            ? "BLOCKED (matching location in block list)"
            : "BLOCKED (location not in allow list)"
        }`
      : `Access would be ${
          mode === "block"
            ? "ALLOWED (location not in block list)"
            : "ALLOWED (matching location in allow list)"
        }`,
    examples: exampleLinks,
    usage_notes:
      "Change the URL parameters to test different locations and filter settings: ?country_code=XX&state_code=YY&mode=block|allow",
    reference:
      "For state_code values, check states.json in your database or common Ukraine codes: 53=Poltavska, 30=Kyiv, 32=Kyivska oblast",
  });
}
