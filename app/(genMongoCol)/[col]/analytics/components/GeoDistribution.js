"use client";

import { useEffect, useState } from "react";
import { COUNTRY_NAMES } from "./countries";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function GeoDistribution({ visitors, isDemoMode = false }) {
  const [countriesData, setCountriesData] = useState([]);
  const [hasGeoData, setHasGeoData] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!visitors || visitors.length === 0) return;

    // Group visitors by country
    const countries = {};
    let foundGeoData = false;

    visitors.forEach((visitor) => {
      // Get country code first
      const countryCode = visitor.country_code || visitor.countryCode || null;

      // Try to get country name, or look it up from the code if missing
      let countryName = visitor.country_name || visitor.country || null;

      // If we have a code but no name, look it up in our COUNTRY_NAMES object
      if (countryCode && !countryName && COUNTRY_NAMES[countryCode]) {
        countryName = COUNTRY_NAMES[countryCode];
      }

      if (countryCode || countryName) {
        foundGeoData = true;
        // Use the code as the key for grouping
        const countryKey =
          countryCode ||
          (countryName ? countryName.replace(/\s+/g, "_") : "Unknown");

        if (!countries[countryKey]) {
          countries[countryKey] = {
            name:
              countryName ||
              (countryCode ? `Country ${countryCode}` : "Unknown"),
            code: countryCode || "",
            count: 0,
          };
        }
        countries[countryKey].count++;
      }
    });

    // Convert to array and sort by count
    const countriesArray = Object.values(countries).sort(
      (a, b) => b.count - a.count
    );
    setCountriesData(countriesArray);
    setHasGeoData(foundGeoData);
  }, [visitors]);

  if (!visitors || visitors.length === 0) {
    return (
      <div className="text-center py-4">
        <h2 className="text-xl font-semibold mb-4">
          {t("geographicDistribution")}
        </h2>
        <p className="text-foreground">{t("noGeoData")}</p>
      </div>
    );
  }

  return (
    <div className="!bg-transparent overflow-hidden">
      <h2 className="text-xl font-semibold mb-4">
        {t("geographicDistribution")}
      </h2>
      <div className="overflow-x-auto max-h-64">
        <table className="!bg-transparent w-full divide-y divide-gray-200 table-fixed">
          <thead className="">
            <tr>
              <th
                scope="col"
                className="!bg-transparent px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2"
              >
                {t("country")}
              </th>
              <th
                scope="col"
                className="!bg-transparent px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
              >
                {t("visits")}
              </th>
              <th
                scope="col"
                className="!bg-transparent px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
              >
                %
              </th>
            </tr>
          </thead>
          <tbody className="!bg-transparent divide-y divide-gray-200">
            {countriesData.map((country, idx) => (
              <tr key={idx}>
                <td className="px-3 py-4 whitespace-nowrap overflow-hidden text-ellipsis">
                  <div className="flex items-center">
                    {country.code && (
                      <span className="mr-2">{getFlagEmoji(country.code)}</span>
                    )}
                    <span className="truncate">{country.name}</span>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">{country.count}</td>
                <td className="px-3 py-4 whitespace-nowrap">
                  {Math.round((country.count / visitors.length) * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper function to generate flag emojis from country codes
function getFlagEmoji(countryCode) {
  if (!countryCode) return "";
  // Some APIs return lowercase country codes
  const code = countryCode.toUpperCase();
  // Validate that it's a 2-letter code before generating emoji
  if (code.length !== 2 || !/^[A-Z]{2}$/.test(code)) return "";

  try {
    const codePoints = code.split("").map((char) => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    // Fallback in case of any errors with emoji generation
    return "";
  }
}
