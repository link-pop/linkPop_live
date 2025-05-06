"use client";

import { useState } from "react";
import Toggle from "@/components/ui/shared/Toggle/Toggle";
import DirectLinksVisitorChart from "@/app/admin/analytics/components/DirectLinksVisitorChart";
import LandingPagesVisitorChart from "@/app/admin/analytics/components/LandingPagesVisitorChart";
import AnalyticsCards from "@/app/admin/analytics/components/AnalyticsCards";
import { useTranslation } from "@/components/Context/TranslationContext";
import LeftNavNewPostBtn from "@/components/Nav/LeftNav/LeftNavNewPostBtn";
import LeftNavNewLandingPageBtn from "@/components/Nav/LeftNav/LeftNavNewLandingPageBtn";
import TitleWithBackButton from "@/components/ui/shared/PageHeading/TitleWithBackButton";

// ! code start DashboardClient
export default function DashboardClient({
  mongoUser,
  directlinksData,
  landingpagesData,
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { text: t("directLinks"), className: "cursor-pointer" },
    { text: t("landingPages"), className: "cursor-pointer" },
  ];

  // Create directlinks content
  const directlinksContent = (
    <div className="space-y-4 md:space-y-8">
      {directlinksData &&
      directlinksData.directlinks &&
      directlinksData.directlinks.length > 0 ? (
        <>
          <div className="flex justify-end mb-4">
            <LeftNavNewPostBtn
              isMobile={false}
              showLabels={true}
              isExpanded={true}
              className="por mxa wfc"
            />
          </div>

          <AnalyticsCards
            {...{
              activeLinks: directlinksData.stats.activeLinks,
              totalLinks: directlinksData.stats.totalLinks,
              monthlyVisitors: directlinksData.stats.monthlyVisitors,
              todayVisitors: directlinksData.stats.todayVisitors,
              yesterdayVisitors: directlinksData.stats.yesterdayVisitors,
              last7DaysVisitors: directlinksData.stats.last7DaysVisitors,
              totalVisitors: directlinksData.stats.totalVisitors,
              type: "directlink",
              stats: directlinksData.stats,
            }}
          />

          <DirectLinksVisitorChart
            {...{
              visitors: directlinksData.visitors,
              directlinks: directlinksData.directlinks,
              visitorsByDirectlink: directlinksData.visitorsByDirectlink,
            }}
          />
        </>
      ) : (
        <div className="text-center p-6 bg-background rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4">
            {t("noDirectLinksFound")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("notCreatedDirectLinksYet")}
          </p>
          <LeftNavNewPostBtn
            isMobile={false}
            showLabels={true}
            isExpanded={true}
            className="por mxa wfc"
          />
        </div>
      )}
    </div>
  );

  // Create landingpages content
  const landingpagesContent = (
    <div className="space-y-4 md:space-y-8">
      {landingpagesData &&
      landingpagesData.landingpages &&
      landingpagesData.landingpages.length > 0 ? (
        <>
          <div className="flex justify-end mb-4">
            <LeftNavNewLandingPageBtn
              isMobile={false}
              showLabels={true}
              isExpanded={true}
              className="por mxa wfc"
            />
          </div>

          <AnalyticsCards
            {...{
              activeLinks: landingpagesData.stats.activeLinks,
              totalLinks: landingpagesData.stats.totalLinks,
              monthlyVisitors: landingpagesData.stats.monthlyVisitors,
              todayVisitors: landingpagesData.stats.todayVisitors,
              yesterdayVisitors: landingpagesData.stats.yesterdayVisitors,
              last7DaysVisitors: landingpagesData.stats.last7DaysVisitors,
              totalVisitors: landingpagesData.stats.totalVisitors,
              type: "landingpage",
              stats: landingpagesData.stats,
            }}
          />

          <LandingPagesVisitorChart
            {...{
              visitors: landingpagesData.visitors,
              landingpages: landingpagesData.landingpages,
              visitorsByLandingPage: landingpagesData.visitorsByLandingPage,
            }}
          />
        </>
      ) : (
        <div className="text-center p-6 bg-background rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4">
            {t("noLandingPagesFound")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("notCreatedLandingPagesYet")}
          </p>
          <LeftNavNewLandingPageBtn
            isMobile={false}
            showLabels={true}
            isExpanded={true}
            className="por mxa wfc"
          />
        </div>
      )}
    </div>
  );

  const contents = [directlinksContent, landingpagesContent];

  return (
    <div className="bg-background rounded-lg">
      <TitleWithBackButton
        title={t("analyticsAndStats")}
        className="fcc p15 text-2xl font-bold mb-6"
      />
      <Toggle
        labels={tabs}
        contents={contents}
        className="mb-4 md:mb-8"
        labelsClassName="text-base md:text-lg font-medium"
        onTabChange={(index) => setActiveTab(index)}
      />
    </div>
  );
}
// ? code end DashboardClient
