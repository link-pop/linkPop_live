"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart2 } from "lucide-react";
import LeftNavNewLandingPageBtn from "@/components/Nav/LeftNav/LeftNavNewLandingPageBtn";
import LeftNavNewPostBtn from "@/components/Nav/LeftNav/LeftNavNewPostBtn";
import Subscription2LimitInfo from "@/components/Post/AddPostCustom/LinkPop/Subscription2LimitInfo";
import {
  fetchUserDirectlinkLandingpageData,
  checkSubscription2Limit,
} from "@/lib/actions/subscription2Limit";
import { getSubscription2DisplayInfo } from "@/components/Post/AddPostCustom/LinkPop/subscription2UIUtils";
import { useTranslation } from "@/components/Context/TranslationContext";
import { DASHBOARD_ROUTE } from "@/lib/utils/constants";

export default function DirectLinkLandingPagePostsTopCustomContent({
  col,
  mongoUser,
}) {
  if (col.name !== "directlinks" && col.name !== "landingpages") return null;

  const { t } = useTranslation();
  const [userSubscription, setUserSubscription] = useState(null);
  const [userDirectlinks, setUserDirectlinks] = useState([]);
  const [userLandingpages, setUserLandingpages] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      if (!mongoUser?._id) return;

      setIsLoadingData(true);
      const userData = await fetchUserDirectlinkLandingpageData(mongoUser._id);
      setUserSubscription(userData.subscription);
      setUserDirectlinks(userData.directlinks);
      setUserLandingpages(userData.landingpages);
      setIsLoadingData(false);
    }

    loadUserData();
  }, [mongoUser?._id]);

  // Calculate subscription limit information
  const limitCheck = !isLoadingData
    ? checkSubscription2Limit(
        userSubscription,
        userDirectlinks,
        userLandingpages,
        false,
        mongoUser // Pass admin/user object so admin logic is respected
      )
    : null;

  const displayInfo = limitCheck
    ? getSubscription2DisplayInfo(limitCheck)
    : null;

  return (
    <div className={`wf`}>
      {displayInfo && (
        <div className="mb-4">
          <Subscription2LimitInfo displayInfo={displayInfo} errors={{}} />
        </div>
      )}

      <Link
        href={DASHBOARD_ROUTE}
        className="fcc aic px-3 py-2 bg-background text-foreground rounded-md hover:underline"
      >
        <BarChart2 className="w-4 h-4 mr-2" />
        {t("viewAllAnalytics")}
      </Link>

      <div className={`fc g4`}>
        {col.name !== "landingpages" && (
          <LeftNavNewPostBtn
            isMobile={false}
            showLabels={true}
            isExpanded={true}
            className="por t30 mxa wfc"
          />
        )}
        {col.name !== "directlinks" && (
          <LeftNavNewLandingPageBtn
            isMobile={false}
            showLabels={true}
            isExpanded={true}
            className="por t30 mxa wfc"
          />
        )}
      </div>
    </div>
  );
}
