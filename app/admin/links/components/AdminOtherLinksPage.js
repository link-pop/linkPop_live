"use client";

import { getAll } from "@/lib/actions/crud";
import { SITE1, SITE2 } from "@/config/env";
import { ExternalLink, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import SubHeading from "@/components/ui/shared/SubHeading/SubHeading";
import PercentageBar from "@/components/ui/shared/PercentageBar/PercentageBar";

export default function AdminOtherLinksPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminOtherLinks"],
    queryFn: async () => {
      // Determine the collection based on site config
      const colName = SITE1 ? "s1sociallinks" : "s2sociallinks";

      const fetchedLinks = await getAll({
        col: colName,
        sort: { clickCount: -1 },
        populate: "createdBy",
      });

      // Filter to only include "other" links
      const filteredLinks =
        fetchedLinks.filter((link) => link.platform === "other") || [];

      // Calculate total clicks
      const totalClicks = filteredLinks.reduce(
        (sum, link) => sum + (link.clickCount || 0),
        0
      );

      // Group by source domain
      const statsBySource = {};

      filteredLinks.forEach((link) => {
        // Extract domain from websiteUrl
        const domain = extractDomain(link.websiteUrl);
        const clicks = link.clickCount || 0;

        if (!statsBySource[domain]) {
          statsBySource[domain] = {
            source: domain,
            totalClicks: 0,
            linksCount: 0,
          };
        }

        statsBySource[domain].totalClicks += clicks;
        statsBySource[domain].linksCount++;
      });

      // Convert to array and sort by total clicks
      const sourceStats = Object.values(statsBySource).sort(
        (a, b) => b.totalClicks - a.totalClicks
      );

      return {
        otherLinks: filteredLinks,
        totalClicks,
        sourceStats,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const otherLinks = data?.otherLinks || [];
  const totalClicks = data?.totalClicks || 0;
  const sourceStats = data?.sourceStats || [];

  if (isLoading) {
    return <div className="p-4 text-center">Loading other links data...</div>;
  }

  if (error) {
    console.error("Error fetching other links:", error);
    return (
      <div className="p-4 text-center text-destructive">
        Failed to load other links data
      </div>
    );
  }

  if (!otherLinks.length) {
    return <div className="p-4 text-center">No other links found</div>;
  }

  // Get the highest click count for scaling charts
  const maxClicks = sourceStats.length > 0 ? sourceStats[0].totalClicks : 0;

  return (
    <div className="fc g20 w-full">
      <div className="fc aic mb-4">
        <SubHeading>Other Links Performance</SubHeading>
        <div className="text-muted-foreground">
          Total clicks:{" "}
          <span className="font-semibold text-foreground">{totalClicks}</span>
        </div>
      </div>

      {/* Domain statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
        <div className="bg-background p-6 rounded-lg shadow">
          <div className="f aic g10 mb-6">
            <BarChart3 className="w-5 h-5" />
            <h3 className="text-xl font-bold">Clicks by Source</h3>
          </div>

          <div className="space-y-4">
            {sourceStats.map((stat) => {
              const percentage =
                totalClicks > 0
                  ? Math.round((stat.totalClicks / totalClicks) * 100)
                  : 0;

              return (
                <div key={stat.source} className="mb-3">
                  <div className="f aic jcsb mb-2">
                    <div className="f aic g8">
                      <div className="p-2 bg-muted rounded-full">
                        <ExternalLink
                          size={16}
                          className="text-[var(--color-brand)]"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{stat.source}</div>
                        <div className="text-xs text-muted-foreground">
                          {stat.linksCount} link
                          {stat.linksCount !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{stat.totalClicks}</div>
                      <div className="text-xs text-muted-foreground">
                        {percentage}%
                      </div>
                    </div>
                  </div>

                  {/* Bar chart */}
                  <PercentageBar
                    percentage={percentage}
                    height={8}
                    minWidth={5}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Top performing links */}
        <div className="bg-background p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-6">
            Top Performing External Links
          </h3>
          <div className="space-y-4">
            {otherLinks.slice(0, 10).map((link) => (
              <div
                key={link._id}
                className="p-4 bg-muted rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="f aic g8 mb-2">
                    <ExternalLink
                      size={16}
                      className="text-[var(--color-brand)]"
                    />
                    <div className="font-medium">{link.label}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {truncateUrl(link.websiteUrl)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Owner: {link.createdBy?.name || "Unknown"}
                  </div>
                </div>
                <div className="text-xl font-bold">{link.clickCount || 0}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to extract domain from URL
function extractDomain(url) {
  if (!url) return "unknown";
  try {
    // Add protocol if missing to avoid URL parsing errors
    if (!url.match(/^https?:\/\//i)) {
      url = "https://" + url;
    }
    const domain = new URL(url).hostname.replace(/^www\./, "");
    return domain || "unknown";
  } catch (e) {
    return "unknown";
  }
}

// Helper function to truncate URLs
function truncateUrl(url) {
  if (!url) return "";
  return url.length > 40 ? url.substring(0, 40) + "..." : url;
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString();
}
