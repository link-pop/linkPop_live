export async function fetchGeoData() {
  if (typeof window === "undefined") return null;

  async function tryIpApi() {
    try {
      // First try direct http endpoint (works in localhost but may be blocked by CORS in production)
      let response = await fetch(
        "http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query"
      );

      // If that fails, try the HTTPS endpoint (jsonip.com is CORS-friendly)
      if (!response.ok) {
        console.log("First geo service failed, trying alternative...");
        response = await fetch("https://jsonip.com");

        if (response.ok) {
          const ipData = await response.json();
          // Once we have the IP, try get more data about it (using secure endpoint)
          if (ipData.ip) {
            const geoResponse = await fetch(
              `https://ipapi.co/${ipData.ip}/json/`
            );
            if (geoResponse.ok) {
              const geoData = await geoResponse.json();
              return {
                country_code: geoData.country_code,
                country_name: geoData.country_name,
                countryCode: geoData.country_code,
                countryName: geoData.country_name,
                language: navigator.language || navigator.userLanguage,
                timezone: geoData.timezone,
                ip: ipData.ip,
                city: geoData.city,
                region: geoData.region,
                region_code: geoData.region_code,
                latitude: geoData.latitude,
                longitude: geoData.longitude,
                geo_source: "ipapi.co (fallback)",
              };
            }
          }
        }
        throw new Error("Primary geo services failed");
      }

      const data = await response.json();

      if (data.status && data.status !== "success") {
        throw new Error(data.message || "IP API returned an error");
      }

      return {
        country_code: data.countryCode,
        country_name: data.country,
        countryCode: data.countryCode,
        countryName: data.country,
        language: navigator.language || navigator.userLanguage,
        timezone: data.timezone,
        ip: data.query,
        city: data.city,
        region: data.regionName,
        region_code: data.region,
        postal: data.zip,
        latitude: data.lat,
        longitude: data.lon,
        isp: data.isp,
        org: data.org,
        mobile: data.mobile,
        proxy: data.proxy,
        hosting: data.hosting,
        geo_source: "ip-api.com",
      };
    } catch (error) {
      console.error("IP-API error:", error);
      throw error;
    }
  }

  async function tryPublicApis() {
    // Try multiple public, CORS-friendly APIs
    const apis = [
      {
        url: "https://ipinfo.io/json",
        parse: async (response) => {
          const data = await response.json();
          const [lat, lon] = data.loc
            ? data.loc.split(",").map(Number)
            : [null, null];
          return {
            country_code: data.country,
            country_name: null,
            countryCode: data.country,
            countryName: null,
            language: navigator.language || navigator.userLanguage,
            timezone: data.timezone,
            ip: data.ip,
            city: data.city,
            region: data.region,
            latitude: lat,
            longitude: lon,
            org: data.org,
            geo_source: "ipinfo.io",
          };
        },
      },
      {
        url: "https://api.ipdata.co?api-key=test", // Their free test API key
        parse: async (response) => {
          const data = await response.json();
          return {
            country_code: data.country_code,
            country_name: data.country_name,
            countryCode: data.country_code,
            countryName: data.country_name,
            language: navigator.language || navigator.userLanguage,
            timezone: data.time_zone?.name,
            ip: data.ip,
            city: data.city,
            region: data.region,
            latitude: data.latitude,
            longitude: data.longitude,
            geo_source: "ipdata.co",
          };
        },
      },
      {
        url: "https://geolocation-db.com/json/",
        parse: async (response) => {
          const data = await response.json();
          return {
            country_code: data.country_code,
            country_name: data.country_name,
            countryCode: data.country_code,
            countryName: data.country_name,
            language: navigator.language || navigator.userLanguage,
            ip: data.IPv4,
            city: data.city,
            latitude: data.latitude,
            longitude: data.longitude,
            geo_source: "geolocation-db.com",
          };
        },
      },
    ];

    // Try each API in sequence until one works
    for (const api of apis) {
      try {
        const response = await fetch(api.url);
        if (response.ok) {
          return await api.parse(response);
        }
      } catch (e) {
        console.log(`API ${api.url} failed:`, e);
        // Continue to the next API
      }
    }

    throw new Error("All geo APIs failed");
  }

  // Import sendErrorToAdmin dynamically since this file runs on client
  async function reportError(error, context) {
    try {
      // Only attempt to report errors server-side
      if (typeof window !== "undefined") {
        console.error("Cannot report error from client:", error);
        return false;
      }

      const { sendErrorToAdmin } = await import(
        "@/lib/actions/sendErrorToAdmin"
      );
      await sendErrorToAdmin({
        error,
        subject: "Geo Data Retrieval Error",
        context,
      });
      return true;
    } catch (err) {
      console.error("Error reporting geo data failure:", err);
      return false;
    }
  }

  // Try the main API first, then fall back to public APIs
  try {
    const geoData = await tryIpApi();

    // Check if we got valid geo data
    if (
      !geoData ||
      (!geoData.country_code && !geoData.countryCode && !geoData.ip)
    ) {
      const error = new Error("Incomplete geo data received");
      console.error("Geo data validation failed:", error, geoData);

      // Try to report this to admin but continue with the flow
      reportError(error, {
        message: "Invalid geo data from primary API",
        geoData,
      });
    }

    return geoData;
  } catch (error) {
    console.log("Primary geo API failed, trying public APIs...");
    try {
      const backupGeoData = await tryPublicApis();

      // Check if backup data is valid
      if (
        !backupGeoData ||
        (!backupGeoData.country_code &&
          !backupGeoData.countryCode &&
          !backupGeoData.ip)
      ) {
        const error = new Error("Incomplete backup geo data received");
        console.error(
          "Backup geo data validation failed:",
          error,
          backupGeoData
        );

        // Try to report this to admin but continue with the flow
        reportError(error, {
          message: "Invalid geo data from backup APIs",
          backupGeoData,
        });
      }

      return backupGeoData;
    } catch (backupError) {
      console.error("All geo APIs failed");

      // Report the complete failure to admin
      reportError(backupError, {
        message: "All geo data APIs failed",
        originalError: error.message,
      });

      // Last resort browser-based fallback
      try {
        const language = navigator.language || navigator.userLanguage;
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Try to extract country from timezone (not reliable but better than nothing)
        let countryCode = null;
        let countryName = null;

        if (timeZone) {
          // Extract potential country code from timezone
          const tzParts = timeZone.split("/");
          if (tzParts.length > 1) {
            // Try to guess country from timezone city
            const tzLocation = tzParts[tzParts.length - 1].replace(/_/g, " ");
            countryName = tzParts[0] !== "Etc" ? tzParts[0] : null;
          }
        }

        if (!countryCode && language) {
          // Try to extract country code from language
          const langParts = language.split("-");
          if (langParts.length > 1) {
            countryCode = langParts[1];

            try {
              countryName = new Intl.DisplayNames([language], {
                type: "region",
              }).of(countryCode);
            } catch (e) {
              countryName = countryCode;
            }
          }
        }

        const fallbackData = {
          country_code: countryCode,
          country_name: countryName,
          countryCode: countryCode,
          countryName: countryName,
          language: language,
          timezone: timeZone,
          geo_source: "browser-fallback",
        };

        // Report that we're using fallback data
        reportError(new Error("Using browser fallback geo data"), {
          message: "All geo APIs failed, using browser fallback",
          fallbackData,
        });

        return fallbackData;
      } catch (fallbackError) {
        console.error("Fallback geo detection failed:", fallbackError);

        // Report the complete failure to admin
        reportError(fallbackError, {
          message: "Complete geo detection failure - even fallback failed",
          originalError: error.message,
          backupError: backupError.message,
        });

        return null;
      }
    }
  }
}
