"use client";

import React, { useState } from "react";
import { getAll } from "@/lib/actions/crud";
import { SITE1 } from "@/config/env";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import GroupByUserView from "./GroupByUserView";
import GroupByUserSwitch from "./GroupByUserSwitch";
import SubHeading from "@/components/ui/shared/SubHeading/SubHeading";

const PAGE_SIZE = 25;

export default function AdminExternalLinksPage() {
  const [byUser, setByUser] = useState(true);

  // Use useQuery to fetch and cache the total count
  const { data: totalCountData } = useQuery({
    queryKey: ["adminExternalLinksCount"],
    queryFn: async () => {
      const colName = SITE1 ? "s1sociallinks" : "s2sociallinks";
      const countResult = await getAll({
        col: colName,
        data: { platform: "other" },
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
    queryKey: ["adminExternalLinks"],
    queryFn: async ({ pageParam = 0 }) => {
      // Determine the collection based on site config
      const colName = SITE1 ? "s1sociallinks" : "s2sociallinks";
      const skip = pageParam * PAGE_SIZE;

      try {
        let fetchedLinks = await getAll({
          col: colName,
          sort: { clickCount: -1 },
          populate: "createdBy",
          skip,
          limit: PAGE_SIZE,
          data: { platform: "other" },
        });

        // Ensure we got an array back
        const links = Array.isArray(fetchedLinks) ? fetchedLinks : [];

        // Double-check filtering on client side to ensure only "other" links
        const filteredLinks = links.filter((link) => link.platform === "other");

        return {
          links: filteredLinks,
          nextPage:
            filteredLinks.length >= PAGE_SIZE ? pageParam + 1 : undefined,
        };
      } catch (error) {
        console.error("Error fetching external links:", error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Flatten the pages
  const externalLinks = data?.pages.flatMap((page) => page.links) || [];

  // Use cached total count or fallback to current page count
  const totalCount = totalCountData ?? externalLinks.length;

  const columns = [
    {
      header: "Label",
      accessor: (link) => link.label,
    },
    {
      header: "URL",
      accessor: (link) => {
        const url = link.websiteUrl || "";
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline f aic g5"
          >
            <ExternalLink size={14} />
            {truncateUrl(url)}
          </a>
        );
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
        <SubHeading>All External Links ({totalCount})</SubHeading>
        <GroupByUserSwitch checked={byUser} onCheckedChange={setByUser} />
      </div>

      <GroupByUserView
        data={externalLinks}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        error={error}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        byUser={byUser}
        loadingText="Loading external links..."
        errorText="Failed to load external links"
        emptyText="No external links found"
        loadingMoreText="Loading more external links..."
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
