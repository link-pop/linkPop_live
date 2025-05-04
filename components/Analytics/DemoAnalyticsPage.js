"use client";

import { useState } from "react";
import VisitorTimeline from "@/app/(genMongoCol)/[col]/analytics/components/OneVisitorTimelineChart";
import GeoDistribution from "@/app/(genMongoCol)/[col]/analytics/components/GeoDistribution";
import DeviceAnalytics from "@/app/(genMongoCol)/[col]/analytics/components/DeviceAnalytics";
import ReferrerAnalytics from "@/app/(genMongoCol)/[col]/analytics/components/ReferrerAnalytics";
import SocialLinksAnalytics from "@/components/Analytics/SocialLinksAnalytics";
import { useTranslation } from "@/components/Context/TranslationContext";
import AdvancedVisitorInsights from "@/app/(genMongoCol)/[col]/analytics/components/AdvancedVisitorInsights";
import UnifiedStatsDashboard from "@/app/(genMongoCol)/[col]/analytics/components/UnifiedStatsDashboard";
import AnalyticsPageHeader from "@/app/(genMongoCol)/[col]/analytics/components/AnalyticsPageHeader";

// ! code start demo data generator
const generateDemoVisitorData = (count = 500) => {
  const today = new Date();
  const visitors = [];
  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Australia",
    "Japan",
    "Brazil",
    "India",
    "South Africa",
    "Mexico",
    "Spain",
    "Italy",
    "Netherlands",
    "Sweden",
  ];

  const cities = {
    "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Miami"],
    Canada: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
    "United Kingdom": [
      "London",
      "Manchester",
      "Birmingham",
      "Liverpool",
      "Edinburgh",
    ],
    Germany: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"],
    France: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice"],
    Australia: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
    Japan: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Sapporo"],
    Brazil: [
      "São Paulo",
      "Rio de Janeiro",
      "Brasília",
      "Salvador",
      "Fortaleza",
    ],
    India: ["Mumbai", "Delhi", "Bangalore", "Kolkata", "Chennai"],
    "South Africa": [
      "Johannesburg",
      "Cape Town",
      "Durban",
      "Pretoria",
      "Port Elizabeth",
    ],
    Mexico: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana"],
    Spain: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza"],
    Italy: ["Rome", "Milan", "Naples", "Turin", "Palermo"],
    Netherlands: [
      "Amsterdam",
      "Rotterdam",
      "The Hague",
      "Utrecht",
      "Eindhoven",
    ],
    Sweden: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås"],
  };

  const devices = ["Mobile", "Desktop", "Tablet"];
  const browsers = ["Chrome", "Safari", "Firefox", "Edge", "Opera"];
  const referrers = [
    "Google",
    "Facebook",
    "Instagram",
    "Twitter",
    "Direct",
    "YouTube",
    "TikTok",
    "Pinterest",
    "LinkedIn",
    "Reddit",
  ];

  // Create visitors across the last 90 days
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);

    const visitDate = new Date(today);
    visitDate.setDate(visitDate.getDate() - daysAgo);
    visitDate.setHours(visitDate.getHours() - hoursAgo);
    visitDate.setMinutes(visitDate.getMinutes() - minutesAgo);

    const country = countries[Math.floor(Math.random() * countries.length)];
    const citiesForCountry = cities[country] || ["Unknown City"];
    const city =
      citiesForCountry[Math.floor(Math.random() * citiesForCountry.length)];
    const device = devices[Math.floor(Math.random() * devices.length)];
    const browser = browsers[Math.floor(Math.random() * browsers.length)];
    const referrer = referrers[Math.floor(Math.random() * referrers.length)];

    // Add clicks data (random between 0-3 clicks per visitor)
    const clicks = Math.floor(Math.random() * 4);
    const hasClicked = clicks > 0;

    visitors.push({
      _id: `demo-visitor-${i}`,
      profileId: "demo-profile",
      profileType: "user",
      visitorId: `visitor-${Math.floor(Math.random() * 200)}`,
      country,
      country_code:
        country === "United States"
          ? "US"
          : country === "Canada"
          ? "CA"
          : country === "United Kingdom"
          ? "GB"
          : country === "Germany"
          ? "DE"
          : country === "France"
          ? "FR"
          : country === "Australia"
          ? "AU"
          : country === "Japan"
          ? "JP"
          : country === "Brazil"
          ? "BR"
          : country === "India"
          ? "IN"
          : country === "South Africa"
          ? "ZA"
          : country === "Mexico"
          ? "MX"
          : country === "Spain"
          ? "ES"
          : country === "Italy"
          ? "IT"
          : country === "Netherlands"
          ? "NL"
          : country === "Sweden"
          ? "SE"
          : "UN",
      city,
      device,
      userAgent:
        device === "Mobile"
          ? "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1"
          : device === "Tablet"
          ? "Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
          : browser === "Chrome"
          ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
          : browser === "Firefox"
          ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0"
          : browser === "Safari"
          ? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15"
          : browser === "Edge"
          ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36 Edg/93.0.961.52"
          : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36 OPR/79.0.4143.72",
      browser,
      referrer,
      ipAddress: `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(
        Math.random() * 256
      )}`,
      language:
        Math.random() > 0.7
          ? "en-US"
          : Math.random() > 0.5
          ? "en-GB"
          : Math.random() > 0.3
          ? "es-ES"
          : Math.random() > 0.2
          ? "fr-FR"
          : Math.random() > 0.1
          ? "de-DE"
          : "ja-JP",
      timezone:
        Math.random() > 0.6
          ? "America/New_York"
          : Math.random() > 0.4
          ? "Europe/London"
          : Math.random() > 0.2
          ? "Asia/Tokyo"
          : "Australia/Sydney",
      hasClicked,
      clicks,
      createdAt: visitDate.toISOString(),
      updatedAt: visitDate.toISOString(),
    });
  }

  return visitors;
};

const generateDemoSocialLinks = (visitorClicks) => {
  // Distribute visitor clicks across social platforms
  const totalClicks = visitorClicks;

  // Calculate distribution percentages for platforms
  const clickDistribution = {
    instagram: 0.18, // 18%
    twitter: 0.11, // 11%
    tiktok: 0.27, // 27%
    youtube: 0.08, // 8%
    snapchat: 0.04, // 4%
    portfolio: 0.12, // 12%
    store: 0.15, // 15%
    blog: 0.05, // 5%
  };

  const platforms = [
    {
      platform: "instagram",
      label: "Instagram",
      username: "yourprofile",
      clickCount: Math.round(totalClicks * clickDistribution.instagram),
    },
    {
      platform: "twitter",
      label: "Twitter",
      username: "yourprofile",
      clickCount: Math.round(totalClicks * clickDistribution.twitter),
    },
    {
      platform: "tiktok",
      label: "TikTok",
      username: "yourprofile",
      clickCount: Math.round(totalClicks * clickDistribution.tiktok),
    },
    {
      platform: "youtube",
      label: "YouTube",
      username: "YourChannel",
      clickCount: Math.round(totalClicks * clickDistribution.youtube),
    },
    {
      platform: "snapchat",
      label: "Snapchat",
      username: "yourprofile",
      clickCount: Math.round(totalClicks * clickDistribution.snapchat),
    },
    {
      platform: "other",
      label: "Portfolio",
      websiteUrl: "https://yourportfolio.com",
      clickCount: Math.round(totalClicks * clickDistribution.portfolio),
    },
    {
      platform: "other",
      label: "Online Store",
      websiteUrl: "https://yourstore.com",
      clickCount: Math.round(totalClicks * clickDistribution.store),
    },
    {
      platform: "other",
      label: "Personal Blog",
      websiteUrl: "https://yourblog.com",
      clickCount: Math.round(totalClicks * clickDistribution.blog),
    },
  ];

  // Add dates of clicks (spread across last 90 days)
  const today = new Date();
  return platforms.map((link, index) => {
    return {
      ...link,
      _id: `demo-link-${index}`,
      clickDate: new Date(
        today.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000
      ),
      createdAt: new Date(
        today.getTime() - 120 * 24 * 60 * 60 * 1000
      ).toISOString(),
    };
  });
};

// Generate visitor data first
const demoVisitors = generateDemoVisitorData(500);

// Calculate total clicks from visitor data
const visitorTotalClicks = demoVisitors.reduce(
  (sum, visitor) => sum + (visitor.clicks || 0),
  0
);

// Demo data sets with consistent click data
const demoData = {
  visitors: demoVisitors,
  links: generateDemoSocialLinks(visitorTotalClicks),
};
// ? code end demo data generator

export default function DemoAnalyticsPage({ className }) {
  const { t } = useTranslation();
  const [selectedTimeframe, setSelectedTimeframe] = useState("last30Days");

  // Extract demo data for the components
  const demoVisitors = demoData.visitors;
  const demoLinks = demoData.links;

  // Get total clicks (now consistent between visitors and social links)
  const totalClicks = visitorTotalClicks;

  // Calculate some stats for the dashboard
  const totalVisits = demoVisitors.length;
  const demoProfileType = "user";
  const demoProfileId = "demo-profile";
  const demoProfileName = "yourprofile";

  return (
    <div className={`w-full py-6 !pt0 ${className || ""}`}>
      {/* Use the same AnalyticsPageHeader component */}
      <AnalyticsPageHeader
        profileTypeName="Profile"
        profileName={demoProfileName}
        visitorsCount={totalVisits}
        isDemoMode={true}
      />

      {/* Use the same UnifiedStatsDashboard component */}
      <UnifiedStatsDashboard
        visitors={demoVisitors}
        profileId={demoProfileId}
        profileType={demoProfileType}
        landingPageId={null}
        isDemoMode={true}
        demoLinks={demoLinks}
        totalClicks={totalClicks}
      />

      {/* Social Links Analytics - using same component */}
      <div className="mb-8">
        <SocialLinksAnalytics
          profileId={demoProfileId}
          landingPageId={null}
          isDemoMode={true}
          demoLinks={demoLinks}
        />
      </div>

      {/* Full-width Visitor Timeline - using same component */}
      <div className="mb-8">
        <VisitorTimeline
          visitors={demoVisitors}
          profileId={demoProfileId}
          landingPageId={null}
          isDemoMode={true}
          demoLinks={demoLinks}
          hideClicks={false}
        />
      </div>

      {/* Three columns for other analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-accent p-4 rounded-lg shadow">
          <GeoDistribution visitors={demoVisitors} isDemoMode={true} />
        </div>

        <div className="bg-accent p-4 rounded-lg shadow">
          <DeviceAnalytics visitors={demoVisitors} isDemoMode={true} />
        </div>

        <div className="bg-accent p-4 rounded-lg shadow">
          <ReferrerAnalytics visitors={demoVisitors} isDemoMode={true} />
        </div>
      </div>

      {/* Advanced Visitor Insights */}
      <div className="mb-8">
        <AdvancedVisitorInsights
          visitors={demoVisitors}
          isDemoMode={true}
          totalClicks={totalClicks}
          isDev={false}
        />
      </div>
    </div>
  );
}
