"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import MostVisitedPages from "./Most/MostVisitedPages";
import MostVisitedCountries from "./Most/MostVisitedCountries";
import MostVisitedPlatforms from "./Most/MostVisitedPlatforms";
import MostVisitedBrowsers from "./Most/MostVisitedBrowsers";
import MostVisitedSystems from "./Most/MostVisitedSystems";
import MostVisitedEmailProviders from "./Most/MostVisitedEmailProviders";
import MostVisitedScreenResolutions from "./Most/MostVisitedScreenResolutions";
import MostVisitedUserLang from "./Most/MostVisitedUserLang";
import MostVisitedUserRAM from "./Most/MostVisitedUserRAM";
import { getAll } from "@/lib/actions/crud";
import { Skeleton } from "@/components/ui/skeleton";
import MostVisitedTimeZones from "./Most/MostVisitedTimeZones";
import MostVisitedHardwareConcurrency from "./Most/MostVisitedHardwareConcurrency";
import MostVisitedColorSchemes from "./Most/MostVisitedColorSchemes";
import MostVisitedReducedMotions from "./Most/MostVisitedReducedMotions";
import MostVisitedCookiesEnabled from "./Most/MostVisitedCookiesEnabled";
import MostVisitedUserStatus from "./Most/MostVisitedUserStatus";
import SwitchShowAnalyticIcons from "./SwitchShowAnalyticIcons";
import PostsLoader from "@/components/Post/Posts/PostsLoader";

function AnalyticsContent() {
  const userId = 'userId'; // assuming userId is defined somewhere
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics", "stats", userId],
    queryFn: async () => {
      try {
        return await getAll({
          col: "analytics",
          data: {},
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
        throw error;
      }
    },
  });

  return (
    <div className="👋 maw990 wf mxa shadow">
      <SwitchShowAnalyticIcons />

      <Suspense fallback={<Skeleton />}>
        {isLoading ? (
          <PostsLoader isLoading={isLoading} />
        ) : (
          <MostVisitedPages analytics={analytics} />
        )}
        <div className="f fwn border-t">
          {isLoading ? (
            <div className="wf fcc g15 mt15">
              {/* <PostsLoader isLoading={isLoading} /> */}
            </div>
          ) : (
            <div className="por fc wf mxa">
              <div className="poa t0 r0 tal wf gray fz10 pl15 pt3">
                some browsers can provide false data
              </div>

              <div className="f fwn wf mxa oxs">
                <MostVisitedCountries analytics={analytics} />
                <MostVisitedPlatforms analytics={analytics} />
                <MostVisitedBrowsers analytics={analytics} />
                <MostVisitedSystems analytics={analytics} />
              </div>
              <div className="f fwn wf mxa oxs">
                <MostVisitedEmailProviders analytics={analytics} />
                <MostVisitedScreenResolutions analytics={analytics} />
                <MostVisitedUserLang analytics={analytics} />
                <MostVisitedUserRAM analytics={analytics} />
              </div>
              <div className="f fwn wf mxa oxs">
                <MostVisitedTimeZones analytics={analytics} />
                <MostVisitedHardwareConcurrency analytics={analytics} />
                <div className="fc">
                  <MostVisitedColorSchemes analytics={analytics} />
                  <MostVisitedReducedMotions analytics={analytics} />
                </div>
                <div className="fc">
                  <MostVisitedCookiesEnabled analytics={analytics} />
                  <MostVisitedUserStatus analytics={analytics} />
                </div>
              </div>
            </div>
          )}
        </div>
      </Suspense>
    </div>
  );
}

export default function AnalyticsDeepPage() {
  return <AnalyticsContent />;
}
