"use client";

import { getAll } from "@/lib/actions/crud";
import { SITE1, SITE2 } from "@/config/env";
import { platformIcons, getPlatformUrl } from "@/lib/data/platformData";
import { BarChart3, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import SubHeading from "@/components/ui/shared/SubHeading/SubHeading";
import PercentageBar from "@/components/ui/shared/PercentageBar/PercentageBar";

export default function AdminSocialLinksClicksPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminSocialLinks"],
    queryFn: async () => {
      // Determine the collection based on site config
      const colName = SITE1 ? "s1sociallinks" : "s2sociallinks";

      const fetchedLinks = await getAll({
        col: colName,
        sort: { clickCount: -1 },
        populate: "createdBy",
      });

      // Filter out "other" links
      const socialMediaLinks =
        fetchedLinks.filter((link) => link.platform !== "other") || [];

      // Calculate platform stats
      const statsByPlatform = {};
      let totalClicks = 0;

      socialMediaLinks.forEach((link) => {
        const platform = link.platform;
        const clicks = link.clickCount || 0;
        totalClicks += clicks;

        if (!statsByPlatform[platform]) {
          statsByPlatform[platform] = {
            platform,
            totalClicks: 0,
            linksCount: 0,
          };
        }

        statsByPlatform[platform].totalClicks += clicks;
        statsByPlatform[platform].linksCount++;
      });

      // Convert to array and sort by total clicks
      const platformStats = Object.values(statsByPlatform).sort(
        (a, b) => b.totalClicks - a.totalClicks
      );

      return {
        socialLinks: socialMediaLinks,
        totalClicks,
        platformStats,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const socialLinks = data?.socialLinks || [];
  const totalClicks = data?.totalClicks || 0;
  const platformStats = data?.platformStats || [];

  if (isLoading) {
    return <div className="p-4 text-center">Loading social links data...</div>;
  }

  if (error) {
    console.error("Error fetching social links:", error);
    return (
      <div className="p-4 text-center text-destructive">
        Failed to load social links data
      </div>
    );
  }

  if (!socialLinks.length) {
    return <div className="p-4 text-center">No social media links found</div>;
  }

  // Get the highest click count for scaling charts
  const maxClicks = platformStats.length > 0 ? platformStats[0].totalClicks : 0;

  return (
    <div className="fc g20 w-full">
      <div className="fc aic mb-4">
        <SubHeading>Social Links Performance</SubHeading>
        <div className="text-muted-foreground">
          Total clicks:{" "}
          <span className="font-semibold text-foreground">{totalClicks}</span>
        </div>
      </div>

      {/* Platform statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
        <div className="bg-background p-6 rounded-lg shadow">
          <div className="f aic g10 mb-6">
            <BarChart3 className="w-5 h-5" />
            <h3 className="text-xl font-bold">Clicks by Platform</h3>
          </div>

          <div className="space-y-4">
            {platformStats.map((stat) => {
              const IconComponent =
                platformIcons[stat.platform] || ArrowUpRight;
              const percentage =
                totalClicks > 0
                  ? Math.round((stat.totalClicks / totalClicks) * 100)
                  : 0;

              return (
                <div key={stat.platform} className="mb-3">
                  <div className="f aic jcsb mb-2">
                    <div className="f aic g8">
                      <div className="p-2 bg-muted rounded-full">
                        <IconComponent
                          size={16}
                          className="text-[var(--color-brand)]"
                        />
                      </div>
                      <div>
                        <div className="font-medium capitalize">
                          {stat.platform}
                        </div>
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

        {/* Most clicked links */}
        <div className="bg-background p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-6">Top Performing Links</h3>
          <div className="space-y-4">
            {socialLinks.slice(0, 10).map((link) => {
              const IconComponent =
                platformIcons[link.platform] || ArrowUpRight;

              return (
                <div
                  key={link._id}
                  className="f aic jcsb p-3 bg-muted rounded-lg"
                >
                  <div className="f aic g10">
                    <IconComponent
                      size={18}
                      className="text-[var(--color-brand)]"
                    />
                    <div>
                      <div className="font-medium">{link.label}</div>
                      <div className="text-xs text-muted-foreground">
                        @{link.username}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Owner: {link.createdBy?.name || "Unknown"}
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-bold">
                    {link.clickCount || 0}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString();
}
