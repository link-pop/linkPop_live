import { getClientIP } from "@/lib/utils/visitor/getClientIP";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Function to normalize Ukrainian region names (copy from geoBlock.js for consistency)
function normalizeUkrainianRegion(region) {
  if (!region) return "";

  // Normalize region name (trim, lowercase for matching)
  const normalizedInput = region.trim();

  // Map of common region name formats to the standardized format in states.json
  const ukraineRegionMap = {
    // ipinfo.io formats
    "Cherkasy Oblast": "Cherkaska Oblast",
    "Chernihiv Oblast": "Chernihivska Oblast",
    "Chernivtsi Oblast": "Chernivetska Oblast",
    "Dnipropetrovsk Oblast": "Dnipropetrovska Oblast",
    "Donetsk Oblast": "Donetska Oblast",
    "Ivano-Frankivsk Oblast": "Ivano-Frankivska Oblast",
    "Kharkiv Oblast": "Kharkivska Oblast",
    "Kherson Oblast": "Khersonska Oblast",
    "Khmelnytskyi Oblast": "Khmelnytska Oblast",
    "Kyiv Oblast": "Kyivska Oblast",
    "Kirovohrad Oblast": "Kirovohradska Oblast",
    "Luhansk Oblast": "Luhanska Oblast",
    "Lviv Oblast": "Lvivska Oblast",
    "Mykolaiv Oblast": "Mykolaivska Oblast",
    "Odessa Oblast": "Odeska Oblast",
    "Poltava Oblast": "Poltavska Oblast",
    "Rivne Oblast": "Rivnenska Oblast",
    "Sumy Oblast": "Sumska Oblast",
    "Ternopil Oblast": "Ternopilska Oblast",
    "Vinnytsia Oblast": "Vinnytska Oblast",
    "Volyn Oblast": "Volynska Oblast",
    "Zakarpattia Oblast": "Zakarpatska Oblast",
    "Zaporizhzhia Oblast": "Zaporizka Oblast",
    "Zhytomyr Oblast": "Zhytomyrska Oblast",

    // Without "Oblast" suffix
    Cherkasy: "Cherkaska Oblast",
    Chernihiv: "Chernihivska Oblast",
    Chernivtsi: "Chernivetska Oblast",
    Dnipropetrovsk: "Dnipropetrovska Oblast",
    Donetsk: "Donetska Oblast",
    "Ivano-Frankivsk": "Ivano-Frankivska Oblast",
    Kharkiv: "Kharkivska Oblast",
    Kherson: "Khersonska Oblast",
    Khmelnytskyi: "Khmelnytska Oblast",
    "Kyiv Region": "Kyivska Oblast",
    Kirovohrad: "Kirovohradska Oblast",
    Luhansk: "Luhanska Oblast",
    Lviv: "Lvivska Oblast",
    Mykolaiv: "Mykolaivska Oblast",
    Odessa: "Odeska Oblast",
    Poltava: "Poltavska Oblast",
    Rivne: "Rivnenska Oblast",
    Sumy: "Sumska Oblast",
    Ternopil: "Ternopilska Oblast",
    Vinnytsia: "Vinnytska Oblast",
    Volyn: "Volynska Oblast",
    Zakarpattia: "Zakarpatska Oblast",
    Zaporizhzhia: "Zaporizka Oblast",
    Zhytomyr: "Zhytomyrska Oblast",

    // Cities
    "Kyiv City": "Kyiv",
    "Kiev City": "Kyiv",
    Kiev: "Kyiv",

    // Alternates from various APIs
    "Cherkas'ka Oblast": "Cherkaska Oblast",
    "Chernihivs'ka Oblast": "Chernihivska Oblast",
    "Chernivets'ka Oblast": "Chernivetska Oblast",
    "Dnipropetrovs'ka Oblast": "Dnipropetrovska Oblast",
    "Donets'ka Oblast": "Donetska Oblast",
    "Ivano-Frankivs'ka Oblast": "Ivano-Frankivska Oblast",
    "Kharkivs'ka Oblast": "Kharkivska Oblast",
    "Khersons'ka Oblast": "Khersonska Oblast",
    "Khmel'nyts'ka Oblast": "Khmelnytska Oblast",
    "Kyivs'ka Oblast": "Kyivska Oblast",
    "Kirovohrads'ka Oblast": "Kirovohradska Oblast",
    "Luhans'ka Oblast": "Luhanska Oblast",
    "L'vivs'ka Oblast": "Lvivska Oblast",
    "Mykolaivs'ka Oblast": "Mykolaivska Oblast",
    "Odes'ka Oblast": "Odeska Oblast",
    "Poltavs'ka Oblast": "Poltavska Oblast",
    "Rivnens'ka Oblast": "Rivnenska Oblast",
    "Sums'ka Oblast": "Sumska Oblast",
    "Ternopil's'ka Oblast": "Ternopilska Oblast",
    "Vinnyts'ka Oblast": "Vinnytska Oblast",
    "Volyns'ka Oblast": "Volynska Oblast",
    "Zakarpats'ka Oblast": "Zakarpatska Oblast",
    "Zaporiz'ka Oblast": "Zaporizka Oblast",
    "Zhytomyrs'ka Oblast": "Zhytomyrska Oblast",
  };

  // Return mapped value if exists, otherwise return original
  return ukraineRegionMap[normalizedInput] || normalizedInput;
}

// Normalize country names to a standard format
function normalizeCountryName(country, countryCode) {
  if (!country) return "";

  // Known country code mappings
  if (countryCode) {
    switch (countryCode.toUpperCase()) {
      case "UA":
        return "Ukraine";
      case "US":
        return "United States";
      case "GB":
        return "United Kingdom";
      case "UK":
        return "United Kingdom";
      case "RU":
        return "Russia";
      // Add more as needed
      default:
        break;
    }
  }

  // If we have a country name but no match on country code
  const countryMap = {
    "United States of America": "United States",
    USA: "United States",
    "U.S.A": "United States",
    "U.S.": "United States",
    "The United States": "United States",

    "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
    "Great Britain": "United Kingdom",
    England: "United Kingdom", // Not exactly correct but common in APIs

    "Russian Federation": "Russia",

    Україна: "Ukraine",
  };

  return countryMap[country] || country;
}

/**
 * Debug endpoint to test IP detection and geolocation services
 */
export async function GET() {
  // Get headers to analyze
  const headersList = headers();
  const headersObj = {};
  headersList.forEach((value, key) => {
    headersObj[key] = value;
  });

  // Get the client IP using our utility function
  const clientIP = getClientIP();

  // Try to get geolocation data from multiple services
  const locationData = {};

  // 1. Try ipapi.co - preferred because it provides region_code
  try {
    const response = await fetch(`https://ipapi.co/${clientIP}/json/`, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (IP Debug Service)",
      },
    });

    if (response.ok) {
      const data = await response.json();
      locationData.ipapi = data;
    } else {
      locationData.ipapi = {
        error: `API responded with status: ${response.status}`,
      };
    }
  } catch (error) {
    locationData.ipapi = {
      error: error.message || "Error fetching ipapi.co data",
    };
  }

  // 2. Try ipinfo.io
  try {
    const response = await fetch(`https://ipinfo.io/${clientIP}/json`, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (IP Debug Service)",
      },
    });

    if (response.ok) {
      const data = await response.json();
      locationData.ipinfo = data;
    } else {
      locationData.ipinfo = {
        error: `API responded with status: ${response.status}`,
      };
    }
  } catch (error) {
    locationData.ipinfo = {
      error: error.message || "Error fetching ipinfo.io data",
    };
  }

  // 3. Try ip-api.com
  try {
    const response = await fetch(`https://ip-api.com/json/${clientIP}`, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (IP Debug Service)",
      },
    });

    if (response.ok) {
      const data = await response.json();
      locationData.ipapi2 = data;
    } else {
      locationData.ipapi2 = {
        error: `API responded with status: ${response.status}`,
      };
    }
  } catch (error) {
    locationData.ipapi2 = {
      error: error.message || "Error fetching ip-api.com data",
    };
  }

  // Extract Vercel headers for region code info
  const vercelRegionCode = headersObj["x-vercel-ip-country-region"];
  const vercelHeaders = {
    countryCode: headersObj["x-vercel-ip-country"] || null,
    countryRegion: vercelRegionCode || null,
    city: headersObj["x-vercel-ip-city"] || null,
    latitude: headersObj["x-vercel-ip-latitude"] || null,
    longitude: headersObj["x-vercel-ip-longitude"] || null,
  };

  // Return the debug information
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    ip: clientIP,
    ipinfo: locationData.ipinfo || { error: "Not available" },
    ipapi: locationData.ipapi || { error: "Not available" },
    ipapi2: locationData.ipapi2 || { error: "Not available" },
    vercel_headers: vercelHeaders,
    all_headers: headersObj,
    test_locations: [
      { country: "Ukraine", state_code: "53", state: "Poltavska oblast" },
      { country: "Ukraine", state_code: "30", state: "Kyiv" },
    ],
    usage_notes:
      "Use state_code for precise region matching, as it's more reliable than name matching",
  });
}
