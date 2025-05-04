"use server";

import { getOne } from "./crud";

// Mock location data for development and testing
const mockLocationData = {
  "127.0.0.1": { country: "Ukraine", state: "Kyiv", state_code: "30" },
  "::1": { country: "Ukraine", state: "Kyiv", state_code: "30" },
  localhost: { country: "Ukraine", state: "Kyiv", state_code: "30" },
  "test-kyiv": { country: "Ukraine", state: "Kyiv", state_code: "30" },
  "test-cherkaska": {
    country: "Ukraine",
    state: "Cherkaska oblast",
    state_code: "71",
  },
  "test-poltava": {
    country: "Ukraine",
    state: "Poltavska oblast",
    state_code: "53",
  },
};

// IP to location service with multiple fallbacks
async function getLocationFromIP(ip) {
  try {
    if (!ip) {
      console.log("No IP provided, using default location");
      return {
        country: "",
        country_code: "",
        state: "",
        state_code: "",
        source: "no-ip",
      };
    }

    // For testing and local development
    if (
      ip.startsWith("test-") ||
      ip === "127.0.0.1" ||
      ip === "::1" ||
      ip === "localhost" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.")
    ) {
      console.log(`Using mock data for IP: ${ip}`);
      const mockData = mockLocationData[ip] || {
        country: "Ukraine",
        state: "Kyiv",
        state_code: "30",
      };
      return mockData;
    }

    // Try multiple geolocation services with fallbacks
    try {
      // First attempt with ipapi.co (provides region_code!)
      console.log(`Fetching location data for IP: ${ip} from ipapi.co`);
      const response = await fetch(`https://ipapi.co/${ip}/json/`, {
        cache: "no-store",
        headers: {
          "User-Agent": "Mozilla/5.0 (Geo Filtering Service)",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Location data from ipapi.co:`, data);

        // Generate country name from code if needed
        let countryName = data.country_name;
        if (countryName === null && data.country_code) {
          // If country_name is explicitly null but we have a code, use the code as name
          countryName = data.country_code;
          console.log(
            `[GeoBlock] Using country_code as name since country_name is null: ${countryName}`
          );
        }

        // Use country_code and region_code directly
        return {
          country: countryName || data.country || "",
          country_code: data.country_code || "",
          state: data.region || "",
          state_code: data.region_code || "",
          source: "ipapi.co",
        };
      } else {
        throw new Error(
          `ipapi.co API responded with status: ${response.status}`
        );
      }
    } catch (firstApiError) {
      console.error(`Error with ipapi.co:`, firstApiError);

      // Second attempt with ipinfo.io (fallback)
      try {
        console.log(`Trying alternative API ipinfo.io for IP: ${ip}`);
        const response = await fetch(`https://ipinfo.io/${ip}/json`, {
          cache: "no-store",
          headers: {
            "User-Agent": "Mozilla/5.0 (Geo Filtering Service)",
          },
        });

        if (!response.ok) {
          throw new Error(
            `ipinfo.io API responded with status: ${response.status}`
          );
        }

        const data = await response.json();
        console.log(`Location data from ipinfo.io:`, data);

        // Get country name from country code if missing
        let countryName = data.country_name;

        // If country_name is explicitly null or undefined but we have a country code, use it
        if (
          (countryName === null || countryName === undefined) &&
          data.country
        ) {
          countryName = data.country;
          console.log(
            `[GeoBlock] Using country code as name since country_name is null: ${countryName}`
          );
        }

        // ipinfo doesn't provide region_code, so we'll use the Vercel header as fallback
        return {
          country: countryName || "",
          country_code: data.country || "",
          state: data.region || "",
          state_code: "", // ipinfo doesn't provide region_code
          source: "ipinfo.io",
        };
      } catch (secondApiError) {
        console.error(`Error with ipinfo.io:`, secondApiError);

        // Third attempt with ip-api.com
        try {
          console.log(`Trying third option ip-api.com for IP: ${ip}`);
          const response = await fetch(`https://ip-api.com/json/${ip}`, {
            cache: "no-store",
            headers: {
              "User-Agent": "Mozilla/5.0 (Geo Filtering Service)",
            },
          });

          if (!response.ok) {
            throw new Error(
              `ip-api.com API responded with status: ${response.status}`
            );
          }

          const data = await response.json();
          console.log(`Location data from ip-api.com:`, data);

          let countryName = data.country;
          // If country is null but countryCode exists, use it
          if (
            (countryName === null || countryName === undefined) &&
            data.countryCode
          ) {
            countryName = data.countryCode;
            console.log(
              `[GeoBlock] Using country code as name since country is null: ${countryName}`
            );
          }

          return {
            country: countryName || "",
            country_code: data.countryCode || "",
            state: data.regionName || "",
            state_code: data.region || "", // ip-api uses 'region' for the code
            source: "ip-api.com",
          };
        } catch (thirdApiError) {
          console.error(`Error with ip-api.com:`, thirdApiError);

          // In development, use mock data as fallback
          if (process.env.NODE_ENV === "development") {
            console.log(`Using development fallback for IP: ${ip}`);
            return {
              country: "Ukraine",
              state: "Kyiv",
              state_code: "30",
              source: "development",
            };
          }

          throw thirdApiError;
        }
      }
    }
  } catch (error) {
    console.error(`Error getting location for IP ${ip}:`, error);

    // In development, use mock data instead of failing
    if (process.env.NODE_ENV === "development") {
      return {
        country: "Ukraine",
        state: "Kyiv",
        state_code: "30",
        source: "development-fallback",
      };
    }

    // Return null values if we can't determine location
    // This will default to allowing access rather than blocking on error
    return {
      country: "",
      country_code: "",
      state: "",
      state_code: "",
      source: "error",
    };
  }
}

// Handle both parameter styles for backward compatibility
export async function geoBlock(
  ipAddressOrParams,
  entityId,
  entityType,
  providedGeoFilter
) {
  // Check if called with positional parameters or an object
  let ipAddress, geoFilter;

  try {
    if (typeof ipAddressOrParams === "object" && ipAddressOrParams !== null) {
      // Called with an object parameter
      ({ ipAddress, entityId, entityType, geoFilter } = ipAddressOrParams);
    } else {
      // Called with positional parameters
      ipAddress = ipAddressOrParams;
      geoFilter = providedGeoFilter;
    }

    // Validate required parameters
    if (!entityId) {
      console.log("[GeoBlock] Missing entityId, allowing access");
      return { isBlocked: false, error: "Missing entityId" };
    }

    if (!entityType) {
      console.log("[GeoBlock] Missing entityType, allowing access");
      return { isBlocked: false, error: "Missing entityType" };
    }

    console.log(
      `[GeoBlock] Checking ${entityType} ID: ${entityId} for IP: ${
        ipAddress || "unknown"
      }`
    );

    // Use the provided geoFilter or fetch it
    let filter = geoFilter;
    if (!filter) {
      // Get the geo filter for this entity using the crud utility
      console.log(
        `[GeoBlock] Fetching filter for ${entityType} ID: ${entityId}`
      );
      filter = await getOne({
        col: "geofilters",
        data: { entityId, entityType, active: true },
      });
      console.log(`[GeoBlock] Filter found: ${filter ? "YES" : "NO"}`);
    }

    // If no geo filter exists or it's not active, allow access
    if (!filter) {
      console.log(
        `[GeoBlock] No active geofilter found for ${entityType} ID: ${entityId}`
      );
      return {
        isBlocked: false,
        visitorLocation: null,
        matchingLocation: null,
        filterMode: null,
      };
    }

    // If filter exists but has no locations, always allow access
    if (
      !filter.locations ||
      !Array.isArray(filter.locations) ||
      filter.locations.length === 0
    ) {
      console.log(
        `[GeoBlock] Geofilter exists but has no locations defined, allowing access`
      );
      return {
        isBlocked: false,
        visitorLocation: null,
        matchingLocation: null,
        filterMode: filter.mode || "block",
      };
    }

    console.log(`[GeoBlock] Found geofilter:`, filter);
    console.log(
      `[GeoBlock] Mode: ${filter.mode || "block"}, Locations count: ${
        filter.locations.length
      }`
    );

    // Get location data from IP
    const visitorLocation = await getLocationFromIP(ipAddress);
    console.log(`[GeoBlock] Location detected:`, visitorLocation);

    // If we couldn't determine the location, default to allowing access
    if (
      !visitorLocation ||
      (!visitorLocation.country && !visitorLocation.country_code)
    ) {
      console.log(`[GeoBlock] No country detected, allowing access`);
      return {
        isBlocked: false,
        visitorLocation: visitorLocation || null,
        matchingLocation: null,
        filterMode: filter.mode || "block",
      };
    }

    // Try to extract region code from Vercel headers if missing
    if (visitorLocation && !visitorLocation.state_code && ipAddress) {
      if (
        global.vercelHeaders &&
        global.vercelHeaders["x-vercel-ip-country-region"]
      ) {
        visitorLocation.state_code =
          global.vercelHeaders["x-vercel-ip-country-region"];
        visitorLocation.source += "+vercel-headers";
        console.log(
          `[GeoBlock] Found state_code in Vercel headers: ${visitorLocation.state_code}`
        );
      }
    }

    // Normalize inputs for comparison - safely handle null/undefined values
    const visitorCountryCode = (visitorLocation.country_code || "")
      .toLowerCase()
      .trim();
    const visitorCountry = (visitorLocation.country || "").toLowerCase().trim();
    const visitorStateCode = (visitorLocation.state_code || "").trim();
    const visitorState = (visitorLocation.state || "").toLowerCase().trim();

    // Debug info
    console.log(`[GeoBlock] Visitor country_code: "${visitorCountryCode}"`);
    console.log(`[GeoBlock] Visitor country: "${visitorCountry}"`);
    console.log(`[GeoBlock] Visitor state_code: "${visitorStateCode}"`);
    console.log(`[GeoBlock] Visitor state: "${visitorState}"`);

    // Check if this location matches any in our filter list
    let matchingLocation = null;
    let matchReason = null;

    // Special handling for null country_name
    if (!visitorCountry && visitorCountryCode) {
      console.log(
        `[GeoBlock] No country name available, using country_code "${visitorCountryCode}" for matching`
      );
    }

    for (const location of filter.locations) {
      if (!location) continue; // Skip if location is null or undefined

      console.log(`[GeoBlock] Checking filter location:`, location);

      // Normalize filter location data - safely handle null/undefined values
      const filterCountryCode = (location.country_code || "")
        .toLowerCase()
        .trim();
      const filterCountry = (location.country || "").toLowerCase().trim();
      const filterStateCode = (location.state_code || "").trim();
      const filterState = (location.state || "").toLowerCase().trim();

      // Debug comparison
      console.log(`[GeoBlock] Filter country_code: "${filterCountryCode}"`);
      console.log(`[GeoBlock] Filter country: "${filterCountry}"`);
      console.log(`[GeoBlock] Filter state_code: "${filterStateCode}"`);
      console.log(`[GeoBlock] Filter state: "${filterState}"`);

      console.log(`[GeoBlock] Comparison:
        country_code: visitor="${visitorCountryCode}" vs filter="${filterCountryCode}" (${
        visitorCountryCode === filterCountryCode ? "MATCH" : "NO MATCH"
      })
        country: visitor="${visitorCountry}" vs filter="${filterCountry}" (${
        visitorCountry === filterCountry ? "MATCH" : "NO MATCH"
      })
        state_code: visitor="${visitorStateCode}" vs filter="${filterStateCode}" (${
        visitorStateCode === filterStateCode ? "MATCH" : "NO MATCH"
      })
        state: visitor="${visitorState}" vs filter="${filterState}" (${
        visitorState === filterState ? "MATCH" : "NO MATCH"
      })
      `);

      // MATCHING STRATEGY:
      // For this specific issue, we need to prioritize country_code matching

      // PRIORITY #1: Match by country_code (most reliable, especially with null country_name)
      if (
        visitorCountryCode &&
        filterCountryCode &&
        visitorCountryCode === filterCountryCode
      ) {
        // Country code matched

        // When we have state codes and they don't match, continue to next location
        if (
          visitorStateCode &&
          filterStateCode &&
          visitorStateCode !== filterStateCode
        ) {
          console.log(
            `[GeoBlock] Country codes match but state codes don't match, continuing to next location`
          );
          continue;
        }

        // When we have state names and they don't match, continue to next location
        if (visitorState && filterState && visitorState !== filterState) {
          console.log(
            `[GeoBlock] Country codes match but state names don't match, continuing to next location`
          );
          continue;
        }

        // If we reach here, either:
        // 1. Country codes match AND state codes/names match, or
        // 2. Country codes match AND filter has no state specified

        if (visitorStateCode && filterStateCode) {
          console.log(`[GeoBlock] MATCHED by country_code + state_code! 🎯`);
          matchReason = "country_code + state_code";
        } else if (visitorState && filterState) {
          console.log(`[GeoBlock] MATCHED by country_code + state name! 🎯`);
          matchReason = "country_code + state name";
        } else {
          console.log(`[GeoBlock] MATCHED by country_code only! 🎯`);
          matchReason = "country_code only";
        }

        matchingLocation = location;
        break;
      }

      // PRIORITY #2: Match by country name (use only if country_code matching failed)
      else if (
        visitorCountry &&
        filterCountry &&
        visitorCountry === filterCountry
      ) {
        // Country names matched

        // When we have state codes and they don't match, continue to next location
        if (
          visitorStateCode &&
          filterStateCode &&
          visitorStateCode !== filterStateCode
        ) {
          console.log(
            `[GeoBlock] Country names match but state codes don't match, continuing to next location`
          );
          continue;
        }

        // When we have state names and they don't match, continue to next location
        if (visitorState && filterState && visitorState !== filterState) {
          console.log(
            `[GeoBlock] Country names match but state names don't match, continuing to next location`
          );
          continue;
        }

        // If we reach here, either:
        // 1. Country names match AND state codes/names match, or
        // 2. Country names match AND filter has no state specified

        if (visitorStateCode && filterStateCode) {
          console.log(`[GeoBlock] MATCHED by country name + state_code! 🎯`);
          matchReason = "country name + state_code";
        } else if (visitorState && filterState) {
          console.log(`[GeoBlock] MATCHED by country name + state name! 🎯`);
          matchReason = "country name + state name";
        } else {
          console.log(`[GeoBlock] MATCHED by country name only! 🎯`);
          matchReason = "country name only";
        }

        matchingLocation = location;
        break;
      }
    }

    // Determine if access should be blocked based on filter mode
    const filterMode = filter.mode || "block";
    const isBlocked =
      filterMode === "block"
        ? !!matchingLocation // Block mode: block if location matches
        : !matchingLocation; // Allow mode: block if location doesn't match

    console.log(
      `[GeoBlock] Mode: ${filterMode}, Matched: ${!!matchingLocation}${
        matchReason ? ` (${matchReason})` : ""
      }, Blocked: ${isBlocked}`
    );

    // Final result summary
    console.log(`[GeoBlock] DECISION SUMMARY:
      IP Address: ${ipAddress || "unknown"}
      Location: ${visitorCountry || "?"} (${visitorCountryCode || "?"})${
      visitorState ? `, ${visitorState}` : ""
    }${visitorStateCode ? ` (${visitorStateCode})` : ""}
      Filter Mode: ${filterMode}
      Locations in Filter: ${filter.locations.length}
      Match Found: ${!!matchingLocation}${
      matchReason ? ` (${matchReason})` : ""
    }
      BLOCKING ACCESS: ${isBlocked}
    `);

    return {
      isBlocked,
      visitorLocation,
      matchingLocation,
      filterMode,
      matchReason,
    };
  } catch (error) {
    console.error("[GeoBlock] Error:", error);
    // Default to not blocking on error
    return {
      isBlocked: false,
      visitorLocation: null,
      matchingLocation: null,
      filterMode: null,
      error: error.message || "Unknown error",
    };
  }
}
