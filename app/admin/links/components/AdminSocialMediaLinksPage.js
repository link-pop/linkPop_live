"use client";

import React, { useState } from "react";
import { getAll } from "@/lib/actions/crud";
import { SITE1 } from "@/config/env";
import { getPlatformUrl } from "@/lib/data/platformData";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import GroupByUserView from "./GroupByUserView";
import GroupByUserSwitch from "./GroupByUserSwitch";
import SubHeading from "@/components/ui/shared/SubHeading/SubHeading";

const PAGE_SIZE = 25;

export default function AdminSocialMediaLinksPage() {
  const [byUser, setByUser] = useState(true);

  // Use useQuery to fetch and cache the total count
  const { data: totalCountData } = useQuery({
    queryKey: ["adminSocialMediaLinksCount"],
    queryFn: async () => {
      const colName = SITE1 ? "s1sociallinks" : "s2sociallinks";
      const countResult = await getAll({
        col: colName,
        data: { platform: { $ne: "other" } },
      });

      return Array.isArray(countResult) ? countResult.length : 0;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - same as the main query
  });

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["adminSocialMediaLinks"],
    queryFn: async ({ pageParam = 0 }) => {
      // Determine the collection based on site config
      const colName = SITE1 ? "s1sociallinks" : "s2sociallinks";
      const skip = pageParam * PAGE_SIZE;

      try {
        const fetchedLinks = await getAll({
          col: colName,
          sort: { clickCount: -1 },
          populate: "createdBy",
          skip,
          limit: PAGE_SIZE,
          data: { platform: { $ne: "other" } },
        });

        // Ensure we got an array back
        const links = Array.isArray(fetchedLinks) ? fetchedLinks : [];

        // Filter on client side to ensure clean data
        const filteredLinks = links.filter((link) => link.platform !== "other");

        return {
          links: filteredLinks,
          nextPage:
            filteredLinks.length >= PAGE_SIZE ? pageParam + 1 : undefined,
        };
      } catch (error) {
        console.error("Error fetching social media links:", error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Flatten the pages
  const socialLinks = data?.pages.flatMap((page) => page.links) || [];

  // Use cached total count or fallback to current page count
  const totalCount = totalCountData ?? socialLinks.length;

  const columns = [
    {
      header: "Platform",
      accessor: (link) => <div className="capitalize">{link.platform}</div>,
    },
    {
      header: "Label",
      accessor: (link) => link.label,
    },
    {
      header: "URL",
      accessor: (link) => {
        try {
          const platformUrl =
            getPlatformUrl(link.platform, link.username) || "#";
          return (
            <a
              href={platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline f aic g5"
            >
              <ExternalLink size={14} />
              {truncateUrl(platformUrl)}
            </a>
          );
        } catch (e) {
          return <span className="text-muted-foreground">Invalid URL</span>;
        }
      },
    },
    {
      header: "Owner",
      accessor: (link) => link.createdBy?.name || "Unknown",
    },
    {
      header: "Clicks",
      accessor: (link) => (
        <span className="font-medium">{link.clickCount || 0}</span>
      ),
    },
    {
      header: "Created",
      accessor: (link) => formatDate(link.createdAt),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SubHeading>All Social Media Links ({totalCount})</SubHeading>
        <GroupByUserSwitch checked={byUser} onCheckedChange={setByUser} />
      </div>

      <GroupByUserView
        data={socialLinks}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        error={error}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        byUser={byUser}
        loadingText="Loading social media links..."
        errorText="Failed to load social media links"
        emptyText="No social media links found"
        loadingMoreText="Loading more social media links..."
        scrollToLoadText="Scroll to load more"
      />
    </div>
  );
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString();
}

// Helper function to truncate URLs
function truncateUrl(url) {
  if (!url) return "";
  return url.length > 40 ? url.substring(0, 40) + "..." : url;
}
