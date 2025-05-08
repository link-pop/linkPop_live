"use client";

import { useState, useEffect } from "react";
import {
  BarChart2,
  Globe,
  Cpu,
  Clock,
  Wifi,
  Eye,
  Activity,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Database,
} from "lucide-react";
import { COUNTRY_NAMES } from "./countries";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function AdvancedVisitorInsights({ visitors, isDev = false }) {
  const [expandedSection, setExpandedSection] = useState(null);
  const { t } = useTranslation();

  if (!visitors || visitors.length === 0) {
    return (
      <div className="text-center p-4 backdrop-blur-sm bg-accent/70 dark:bg-accent/40 border border-accent/30 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          {t("advancedVisitorInsights")}
        </h2>
        <p className="text-foreground">{t("noVisitorDataToAnalyze")}</p>
      </div>
    );
  }

  // Extract unique visitor count based on IP addresses
  const uniqueIPs = new Set(visitors.map((v) => v.ipAddress)).size;

  // Calculate return visitor rate
  const ipCounts = {};
  visitors.forEach((v) => {
    ipCounts[v.ipAddress] = (ipCounts[v.ipAddress] || 0) + 1;
  });
  const returningVisitors = Object.values(ipCounts).filter(
    (count) => count > 1
  ).length;
  const returnRate = Math.round((returningVisitors / uniqueIPs) * 100) || 0;

  // Calculate average time between visits for return visitors
  let avgTimeBetweenVisits = "N/A";
  if (returningVisitors > 0) {
    const ipTimestamps = {};
    visitors.forEach((v) => {
      if (!ipTimestamps[v.ipAddress]) {
        ipTimestamps[v.ipAddress] = [];
      }
      ipTimestamps[v.ipAddress].push(new Date(v.createdAt).getTime());
    });

    let totalTimeDiff = 0;
    let totalDiffs = 0;

    Object.values(ipTimestamps).forEach((timestamps) => {
      if (timestamps.length > 1) {
        // Sort by time
        timestamps.sort((a, b) => a - b);

        // Calculate time differences
        for (let i = 1; i < timestamps.length; i++) {
          const diff = timestamps[i] - timestamps[i - 1];
          totalTimeDiff += diff;
          totalDiffs++;
        }
      }
    });

    if (totalDiffs > 0) {
      const avgTimeMs = totalTimeDiff / totalDiffs;
      const avgTimeDays = avgTimeMs / (1000 * 60 * 60 * 24);

      if (avgTimeDays < 1) {
        const avgTimeHours = avgTimeMs / (1000 * 60 * 60);
        avgTimeBetweenVisits = `${avgTimeHours.toFixed(1)} hours`;
      } else {
        avgTimeBetweenVisits = `${avgTimeDays.toFixed(1)} days`;
      }
    }
  }

  // Analyze browser data
  const browserData = {};
  visitors.forEach((v) => {
    let browser = "Unknown";

    if (v.userAgent) {
      if (/chrome/i.test(v.userAgent) && !/chromium|edg/i.test(v.userAgent)) {
        browser = "Chrome";
      } else if (/firefox/i.test(v.userAgent)) {
        browser = "Firefox";
      } else if (
        /safari/i.test(v.userAgent) &&
        !/chrome|chromium/i.test(v.userAgent)
      ) {
        browser = "Safari";
      } else if (/edg/i.test(v.userAgent)) {
        browser = "Edge";
      } else if (/msie|trident/i.test(v.userAgent)) {
        browser = "Internet Explorer";
      }
    }

    browserData[browser] = (browserData[browser] || 0) + 1;
  });

  // Analyze device types
  const deviceData = {};
  visitors.forEach((v) => {
    let device = "Unknown";

    if (v.userAgent) {
      if (/mobile/i.test(v.userAgent) && !/tablet/i.test(v.userAgent)) {
        device = "Mobile";
      } else if (/tablet|ipad/i.test(v.userAgent)) {
        device = "Tablet";
      } else if (/windows|macintosh|linux/i.test(v.userAgent)) {
        device = "Desktop";
      }
    }

    deviceData[device] = (deviceData[device] || 0) + 1;
  });

  // Analyze time patterns
  const hourData = Array(24).fill(0);
  const dayData = Array(7).fill(0);

  visitors.forEach((v) => {
    const date = new Date(v.createdAt);
    const hour = date.getHours();
    const day = date.getDay();

    hourData[hour]++;
    dayData[day]++;
  });

  // Find peak hours and days
  const peakHourIndex = hourData.indexOf(Math.max(...hourData));
  const peakHour = `${peakHourIndex}:00 - ${peakHourIndex + 1}:00`;

  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const peakDayIndex = dayData.indexOf(Math.max(...dayData));
  const peakDay = weekdays[peakDayIndex];

  // Add day time analysis
  const morningVisits = hourData
    .slice(5, 12)
    .reduce((sum, count) => sum + count, 0);
  const afternoonVisits = hourData
    .slice(12, 17)
    .reduce((sum, count) => sum + count, 0);
  const eveningVisits = hourData
    .slice(17, 22)
    .reduce((sum, count) => sum + count, 0);
  const nightVisits = [...hourData.slice(22), ...hourData.slice(0, 5)].reduce(
    (sum, count) => sum + count,
    0
  );

  const dayTimeData = [
    { time: "Morning (5am-12pm)", count: morningVisits },
    { time: "Afternoon (12pm-5pm)", count: afternoonVisits },
    { time: "Evening (5pm-10pm)", count: eveningVisits },
    { time: "Night (10pm-5am)", count: nightVisits },
  ].sort((a, b) => b.count - a.count);

  const peakDayTime = dayTimeData[0].time;
  const peakDayTimePercentage = Math.round(
    (dayTimeData[0].count / visitors.length) * 100
  );

  // Network information
  const networkStats = {
    proxyDetected: visitors.filter((v) => v.proxy).length,
    isMobile: visitors.filter((v) => v.mobile).length,
    isHosting: visitors.filter((v) => v.hosting).length,
  };

  const proxyPercentage =
    Math.round((networkStats.proxyDetected / visitors.length) * 100) || 0;

  // Location insights
  const countries = {};
  const cities = {};
  const geoSources = {};

  visitors.forEach((v) => {
    // Get country code first - check all possible property paths
    const countryCode = v.country_code || v.countryCode || v.country || null;

    // Try to get country name from all possible sources
    let countryName = v.country_name || v.countryName || null;

    // If we have a code but no name, look it up in our COUNTRY_NAMES object
    if (countryCode && COUNTRY_NAMES[countryCode]) {
      countryName = COUNTRY_NAMES[countryCode];
    }

    if (countryName) {
      countries[countryName] = (countries[countryName] || 0) + 1;
    } else if (countryCode) {
      // Use code as fallback if no name is found
      countries[`Country ${countryCode}`] =
        (countries[`Country ${countryCode}`] || 0) + 1;
    }

    // Extract city information with more thorough fallbacks
    const cityName = v.city || null;

    // Make sure we have a valid city name before counting it
    if (cityName && typeof cityName === "string" && cityName.trim() !== "") {
      const normalizedCityName = cityName.trim();
      cities[normalizedCityName] = (cities[normalizedCityName] || 0) + 1;
    }

    // Track geo data sources
    const geoSource = v.geo_source || "unknown";
    geoSources[geoSource] = (geoSources[geoSource] || 0) + 1;
  });

  // Sort countries by count and show top 20
  const topCountries = Object.entries(countries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  // Sort cities by count and show top 20
  const topCities = Object.entries(cities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const topGeoSources = Object.entries(geoSources)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  // Language distribution - show top 20
  const languageData = {};
  visitors.forEach((v) => {
    if (v.language) {
      languageData[v.language] = (languageData[v.language] || 0) + 1;
    }
  });

  const topLanguages = Object.entries(languageData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  // Timezone distribution - show top 20
  const timezoneData = {};
  visitors.forEach((v) => {
    if (v.timezone) {
      timezoneData[v.timezone] = (timezoneData[v.timezone] || 0) + 1;
    }
  });

  const topTimezones = Object.entries(timezoneData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  // Toggles section expansion
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <div className="backdrop-blur-sm bg-accent/70 dark:bg-accent/40 border border-accent/30 p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {t("advancedVisitorInsights")}
      </h2>

      {/* Engagement Section */}
      <div className="border rounded-md overflow-hidden">
        <div
          className={`flex items-center justify-between p-3 bg-background/40 cursor-pointer hover:bg-background/80`}
          onClick={() => toggleSection("engagement")}
        >
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-primary mr-2" />
            <h3 className="font-medium">{t("engagementMetrics")}</h3>
          </div>
          {expandedSection === "engagement" ? (
            <ChevronDown />
          ) : (
            <ChevronRight />
          )}
        </div>

        {expandedSection === "engagement" && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded p-3 bg-card">
              <div className="text-sm text-muted-foreground">
                {t("totalVisitors")}
              </div>
              <div className="text-xl font-semibold">{visitors.length}</div>
            </div>
            <div className="border rounded p-3 bg-card">
              <div className="text-sm text-muted-foreground">
                {t("uniqueVisitors")}
              </div>
              <div className="text-xl font-semibold">{uniqueIPs}</div>
            </div>
            <div className="border rounded p-3 bg-card">
              <div className="text-sm text-muted-foreground">
                {t("returnRate")}
              </div>
              <div className="text-xl font-semibold">{returnRate}%</div>
            </div>
            <div className="border rounded p-3 bg-card">
              <div className="text-sm text-muted-foreground">
                {t("avgTimeBetweenVisits")}
              </div>
              <div className="text-xl font-semibold">
                {avgTimeBetweenVisits}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Device & Tech Section */}
      <div className="border rounded-md overflow-hidden">
        <div
          className={`flex items-center justify-between p-3 bg-background/40 cursor-pointer hover:bg-background/80`}
          onClick={() => toggleSection("tech")}
        >
          <div className="flex items-center">
            <Cpu className="w-5 h-5 text-primary mr-2" />
            <h3 className="font-medium">{t("deviceAndTechnology")}</h3>
          </div>
          {expandedSection === "tech" ? <ChevronDown /> : <ChevronRight />}
        </div>

        {expandedSection === "tech" && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded p-3 bg-card">
              <div className="text-sm text-muted-foreground mb-2">
                {t("devices")}
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {Object.entries(deviceData).map(([device, count], index) => (
                  <div key={index} className="flex justify-between">
                    <span>{device}</span>
                    <span className="font-medium">
                      {Math.round((count / visitors.length) * 100)}% ({count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border rounded p-3 bg-card">
              <div className="text-sm text-muted-foreground mb-2">
                {t("browsers")}
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {Object.entries(browserData).map(([browser, count], index) => (
                  <div key={index} className="flex justify-between">
                    <span>{browser}</span>
                    <span className="font-medium">
                      {Math.round((count / visitors.length) * 100)}% ({count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time Patterns Section */}
      <div className="border rounded-md overflow-hidden">
        <div
          className={`flex items-center justify-between p-3 bg-background/40 cursor-pointer hover:bg-background/80`}
          onClick={() => toggleSection("time")}
        >
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-primary mr-2" />
            <h3 className="font-medium">{t("temporalPatterns")}</h3>
          </div>
          {expandedSection === "time" ? <ChevronDown /> : <ChevronRight />}
        </div>

        {expandedSection === "time" && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded p-3 bg-card">
              <div className="text-sm text-muted-foreground">
                {t("peakTrafficHour")}
              </div>
              <div className="text-xl font-semibold">{peakHour}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {t("basedOnVisitorLocalTime")}
              </div>
            </div>
            <div className="border rounded p-3 bg-card">
              <div className="text-sm text-muted-foreground">
                {t("mostActiveDay")}
              </div>
              <div className="text-xl font-semibold">
                {t(peakDay.toLowerCase())}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round((dayData[peakDayIndex] / visitors.length) * 100)}%{" "}
                {t("ofAllVisits")}
              </div>
            </div>

            <div className="border rounded p-3 bg-card">
              <div className="text-sm text-muted-foreground">
                {t("peakDayTime")}
              </div>
              <div className="text-xl font-semibold">
                {t(
                  peakDayTime
                    .replace(/\s+\([^)]+\)/g, "")
                    .replace(/\s/g, "")
                    .toLowerCase()
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {peakDayTimePercentage}% {t("ofAllVisits")}
              </div>
            </div>

            <div className="border rounded p-3 bg-card">
              <div className="text-sm text-muted-foreground mb-2">
                {t("dayTimeDistribution")}
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {dayTimeData.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>
                      {t(
                        item.time
                          .replace(/\s+\([^)]+\)/g, "")
                          .replace(/\s/g, "")
                          .toLowerCase()
                      )}
                    </span>
                    <span className="font-medium">
                      {Math.round((item.count / visitors.length) * 100)}% (
                      {item.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 border rounded p-3 bg-card">
              <div className="text-sm text-muted-foreground mb-2">
                {t("timezoneDistribution")}
              </div>
              {topTimezones.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {topTimezones.map(([timezone, count], index) => (
                    <div key={index} className="flex justify-between">
                      <span>{timezone}</span>
                      <span className="font-medium">
                        {Math.round((count / visitors.length) * 100)}% ({count})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {t("noTimezoneData")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Geographic Insights */}
      <div className="border rounded-md overflow-hidden">
        <div
          className={`flex items-center justify-between p-3 bg-background/40 cursor-pointer hover:bg-background/80`}
          onClick={() => toggleSection("geo")}
        >
          <div className="flex items-center">
            <Globe className="w-5 h-5 text-primary mr-2" />
            <h3 className="font-medium">{t("geographicInsights")}</h3>
          </div>
          {expandedSection === "geo" ? <ChevronDown /> : <ChevronRight />}
        </div>

        {expandedSection === "geo" && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded p-3 bg-card">
              <div className="text-sm text-muted-foreground mb-2">
                {t("topCountries")}
              </div>
              {topCountries.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {topCountries.map(([country, count], index) => (
                    <div key={index} className="flex justify-between">
                      <span>{country}</span>
                      <span className="font-medium">
                        {Math.round((count / visitors.length) * 100)}% ({count})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {t("noCountryData")}
                </div>
              )}
            </div>
            <div className="border rounded p-3 bg-card">
              <div className="text-sm text-muted-foreground mb-2">
                {t("topCities")}
              </div>
              {topCities.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {topCities.map(([city, count], index) => (
                    <div key={index} className="flex justify-between">
                      <span>{city}</span>
                      <span className="font-medium">
                        {Math.round((count / visitors.length) * 100)}% ({count})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {t("noCityData")}
                </div>
              )}
            </div>
            <div className="col-span-1 md:col-span-2 border rounded p-3 bg-card">
              <div className="text-sm text-muted-foreground mb-2">
                {t("languagePreferences")}
              </div>
              {topLanguages.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {topLanguages.map(([language, count], index) => (
                    <div key={index} className="flex justify-between">
                      <span>{language}</span>
                      <span className="font-medium">
                        {Math.round((count / visitors.length) * 100)}% ({count})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {t("noLanguageData")}
                </div>
              )}
            </div>
            {isDev && (
              <div className="col-span-1 md:col-span-2 border rounded p-3 bg-card">
                <div className="text-sm text-muted-foreground mb-2">
                  {t("geoDataSources")}
                </div>
                {topGeoSources.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {topGeoSources.map(([source, count], index) => (
                      <div key={index} className="flex justify-between">
                        <span>{source}</span>
                        <span className="font-medium">
                          {Math.round((count / visitors.length) * 100)}% (
                          {count})
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {t("noGeoSourceData")}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
