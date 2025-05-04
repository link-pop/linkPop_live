"use client";

import React, { useState } from "react";
import { getAll } from "@/lib/actions/crud";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import GroupByUserView from "./GroupByUserView";
import GroupByUserSwitch from "./GroupByUserSwitch";
import SubHeading from "@/components/ui/shared/SubHeading/SubHeading";

const PAGE_SIZE = 25;

export default function AdminLinksPage() {
  const [byUser, setByUser] = useState(true);

  // Use useQuery to fetch and cache the total count
  const { data: totalCountData } = useQuery({
    queryKey: ["adminDirectlinksCount"],
    queryFn: async () => {
      const countResult = await getAll({
        col: "directlinks",
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
    queryKey: ["adminDirectlinks"],
    queryFn: async ({ pageParam = 0 }) => {
      const skip = pageParam * PAGE_SIZE;
      const fetchedLinks = await getAll({
        col: "directlinks",
        sort: { createdAt: -1 },
        populate: "createdBy",
        skip,
        limit: PAGE_SIZE,
      });

      return {
        links: fetchedLinks || [],
        nextPage: fetchedLinks?.length >= PAGE_SIZE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Flatten the pages
  const links = data?.pages.flatMap((page) => page.links) || [];

  // Use cached total count or fallback to current page count
  const totalCount = totalCountData ?? links.length;

  const columns = [
    {
      header: "Name",
      accessor: (link) => (
        <a
          href={`/${link.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {link.name}
        </a>
      ),
    },
    {
      header: "Owner",
      accessor: (link) => link.createdBy?.name || "Unknown",
    },
    {
      header: "Destination URL",
      accessor: (link) => (
        <a
          href={link.destinationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {truncateUrl(link.destinationUrl)}
        </a>
      ),
    },
    {
      header: "Free URL",
      accessor: (link) =>
        link.freeUrl ? (
          <a
            href={link.freeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {truncateUrl(link.freeUrl)}
          </a>
        ) : (
          "—"
        ),
    },
    {
      header: "Status",
      accessor: (link) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            link.active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {link.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Created",
      accessor: (link) => new Date(link.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SubHeading>All Directlinks ({totalCount})</SubHeading>
        <GroupByUserSwitch checked={byUser} onCheckedChange={setByUser} />
      </div>

      <GroupByUserView
        data={links}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        error={error}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        byUser={byUser}
        loadingText="Loading directlinks..."
        errorText="Failed to load directlinks"
        emptyText="No directlinks found"
        loadingMoreText="Loading more directlinks..."
        scrollToLoadText="Scroll to load more"
      />
    </div>
  );
}

// Helper function to truncate long URLs for display
function truncateUrl(url) {
  if (!url) return "";
  return url.length > 30 ? url.substring(0, 30) + "..." : url;
}
