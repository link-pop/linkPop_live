"use client";

import { Suspense } from "react";
import { getSocialMediaLinks } from "@/lib/actions/getSocialMediaLinks";
import { useTranslation } from "@/components/Context/TranslationContext";
import { BarChart, ExternalLink } from "lucide-react";
import { platformIcons } from "@/lib/data/platformData";
import { useQuery } from "@tanstack/react-query";
import PercentageBar from "@/components/ui/shared/PercentageBar/PercentageBar";

export default function SocialLinksAnalytics({
  profileId,
  landingPageId = null,
  isDemoMode = false,
  demoLinks = [],
}) {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-center">Loading social links analytics...</div>
      }
    >
      <SocialLinksAnalyticsContent
        profileId={profileId}
        landingPageId={landingPageId}
        isDemoMode={isDemoMode}
        demoLinks={demoLinks}
      />
    </Suspense>
  );
}

function SocialLinksAnalyticsContent({
  profileId,
  landingPageId = null,
  isDemoMode = false,
  demoLinks = [],
}) {
  const { t } = useTranslation();

  // Use React Query for data fetching (only if not in demo mode)
  const {
    data: fetchedLinks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["socialMediaLinks", profileId, landingPageId],
    queryFn: () => getSocialMediaLinks(profileId, landingPageId),
    enabled: !!profileId && !isDemoMode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use either demo links or fetched links
  const links = isDemoMode ? demoLinks : fetchedLinks;

  if (!isDemoMode && isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="h-8 w-8 spinner mx-auto"></div>
      </div>
    );
  }

  if (!isDemoMode && error) {
    console.error("Error fetching social links:", error);
    return (
      <div className="p-4 text-center text-destructive">
        {t("errorFetchingSocialLinks")}
      </div>
    );
  }

  if (!links || links.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t("noSocialMediaLinks")}
      </div>
    );
  }

  // Separate links by type
  const socialLinks = links.filter((link) => link.platform !== "other");
  const otherLinks = links.filter((link) => link.platform === "other");

  // Sort links by click count (highest first)
  const sortedSocialLinks = [...socialLinks].sort(
    (a, b) => (b.clickCount || 0) - (a.clickCount || 0)
  );
  const sortedOtherLinks = [...otherLinks].sort(
    (a, b) => (b.clickCount || 0) - (a.clickCount || 0)
  );

  // Calculate total clicks across all links
  const totalClicks = links.reduce(
    (sum, link) => sum + (link.clickCount || 0),
    0
  );

  // Find the highest click count for scaling the visualization
  const maxClicks =
    links.length > 0
      ? Math.max(...links.map((link) => link.clickCount || 0))
      : 0;

  // Helper function to render link items
  const renderLinkItem = (link) => {
    const IconComponent = platformIcons[link.platform] || ExternalLink;
    const clickCount = link.clickCount || 0;

    // Calculate percentage of total clicks (avoid division by zero)
    const percentage =
      totalClicks > 0 ? Math.round((clickCount / totalClicks) * 100) : 0;

    return (
      <div key={link._id} className="p-2 mb-3 bg-background rounded">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-accent rounded-full">
              <IconComponent size={18} />
            </div>
            <div>
              <div className="font-medium">{link.label}</div>
              <div className="text-sm text-muted-foreground">
                {link.platform === "other"
                  ? link.websiteUrl
                  : `@${link.username}`}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">{clickCount}</div>
            <div className="text-xs text-muted-foreground">{percentage}%</div>
          </div>
        </div>

        {/* Visualization bar using PercentageBar component */}
        <div className="mt-3">
          <PercentageBar
            percentage={percentage}
            height={8}
            animate={true}
            minWidth={5}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-accent p-4 rounded-lg shadow">
      <div className="flex items-center">
        <BarChart className="mr-2" size={20} />
        <h2 className="text-xl font-semibold">
          {t("socialLinksPerformance")} ({totalClicks} {t("linkClicks")})
        </h2>
      </div>
      {true && (
        <p className="mb-4 fz12 text-muted-foreground">
          {t("socialLinksPerformanceDescription")}
        </p>
      )}

      {totalClicks === 0 ? (
        <div className="p-3 bg-background rounded text-center text-muted-foreground">
          {t("noLinkClicks")}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Social Media Links Column */}
          <div>
            {sortedSocialLinks.length > 0 && (
              <>
                <h3 className="text-lg font-medium mb-3">
                  {t("socialMediaLinks")}
                </h3>
                <div>{sortedSocialLinks.map(renderLinkItem)}</div>
              </>
            )}
          </div>

          {/* Other Links Column */}
          <div>
            {sortedOtherLinks.length > 0 ? (
              <>
                <h3 className="text-lg font-medium mb-3">{t("otherLinks")}</h3>
                <div>{sortedOtherLinks.map(renderLinkItem)}</div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-3">{t("otherLinks")}</h3>
                <div className="p-3 bg-background rounded text-center text-muted-foreground">
                  {t("noOtherLinks")}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
