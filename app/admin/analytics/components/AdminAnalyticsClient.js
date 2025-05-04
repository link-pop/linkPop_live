"use client";

import { useState } from "react";
import Toggle from "@/components/ui/shared/Toggle/Toggle";
import AnalyticsCards from "./AnalyticsCards";
import DirectLinksVisitorChart from "./DirectLinksVisitorChart";
import LandingPagesVisitorChart from "./LandingPagesVisitorChart";

// ! code start AdminAnalyticsClient
export default function AdminAnalyticsClient({
  directlinksData,
  landingpagesData,
}) {
  const tabs = [
    { text: "Direct Links", className: "cursor-pointer" },
    { text: "Landing Pages", className: "cursor-pointer" },
  ];

  // Create contents based on tab selection
  const directlinksContent = (
    <div className="space-y-4 md:space-y-8">
      <AnalyticsCards
        activeLinks={directlinksData.stats.activeLinks}
        totalLinks={directlinksData.stats.totalLinks}
        monthlyVisitors={directlinksData.stats.monthlyVisitors}
        todayVisitors={directlinksData.stats.todayVisitors}
        yesterdayVisitors={directlinksData.stats.yesterdayVisitors}
        last7DaysVisitors={directlinksData.stats.last7DaysVisitors}
        totalVisitors={directlinksData.stats.totalVisitors}
        type="directlink"
        stats={directlinksData.stats}
      />

      <DirectLinksVisitorChart
        visitors={directlinksData.visitors}
        directlinks={directlinksData.directlinks}
        visitorsByDirectlink={directlinksData.visitorsByDirectlink}
      />
    </div>
  );

  const landingpagesContent = (
    <div className="space-y-4 md:space-y-8">
      <AnalyticsCards
        activeLinks={landingpagesData.stats.activeLinks}
        totalLinks={landingpagesData.stats.totalLinks}
        monthlyVisitors={landingpagesData.stats.monthlyVisitors}
        todayVisitors={landingpagesData.stats.todayVisitors}
        yesterdayVisitors={landingpagesData.stats.yesterdayVisitors}
        last7DaysVisitors={landingpagesData.stats.last7DaysVisitors}
        totalVisitors={landingpagesData.stats.totalVisitors}
        type="landingpage"
        stats={landingpagesData.stats}
      />

      <LandingPagesVisitorChart
        visitors={landingpagesData.visitors}
        landingpages={landingpagesData.landingpages}
        visitorsByLandingPage={landingpagesData.visitorsByLandingPage}
      />
    </div>
  );

  const contents = [directlinksContent, landingpagesContent];

  return (
    <Toggle
      labels={tabs}
      contents={contents}
      className="mb-4 md:mb-8"
      labelsClassName="text-base md:text-lg font-medium"
    />
  );
}
// ? code end AdminAnalyticsClient
