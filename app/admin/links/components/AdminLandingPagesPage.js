"use client";

import React, { useState } from "react";
import { getAll } from "@/lib/actions/crud";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import GroupByUserView from "./GroupByUserView";
import GroupByUserSwitch from "./GroupByUserSwitch";
import SubHeading from "@/components/ui/shared/SubHeading/SubHeading";

const PAGE_SIZE = 25;

export default function AdminLandingPagesPage() {
  const [byUser, setByUser] = useState(true);

  // Use useQuery to fetch and cache the total count
  const { data: totalCountData } = useQuery({
    queryKey: ["adminLandingPagesCount"],
    queryFn: async () => {
      const countResult = await getAll({
        col: "landingpages",
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
    queryKey: ["adminLandingPages"],
    queryFn: async ({ pageParam = 0 }) => {
      const skip = pageParam * PAGE_SIZE;
      const fetchedPages = await getAll({
        col: "landingpages",
        sort: { createdAt: -1 },
        populate: "createdBy",
        skip,
        limit: PAGE_SIZE,
      });

      return {
        landingPages: fetchedPages || [],
        nextPage: fetchedPages?.length >= PAGE_SIZE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Flatten the pages
  const landingPages = data?.pages.flatMap((page) => page.landingPages) || [];

  // Use cached total count or fallback to current page count
  const totalCount = totalCountData ?? landingPages.length;

  const columns = [
    {
      header: "Name",
      accessor: (page) => (
        <a
          href={`/${page.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {page.name}
        </a>
      ),
    },
    {
      header: "Owner",
      accessor: (page) => page.createdBy?.name || "Unknown",
    },
    {
      header: "Username",
      accessor: (page) => page.username,
    },
    {
      header: "Bio",
      accessor: (page) => truncateText(page.bio || "No bio"),
    },
    {
      header: "Status",
      accessor: (page) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            page.active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {page.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Created",
      accessor: (page) => new Date(page.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SubHeading>All Landing Pages ({totalCount})</SubHeading>
        <GroupByUserSwitch checked={byUser} onCheckedChange={setByUser} />
      </div>

      <GroupByUserView
        data={landingPages}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        error={error}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        byUser={byUser}
        loadingText="Loading landing pages..."
        errorText="Failed to load landing pages"
        emptyText="No landing pages found"
        loadingMoreText="Loading more landing pages..."
        scrollToLoadText="Scroll to load more"
      />
    </div>
  );
}

// Helper function to truncate long text for display
function truncateText(text) {
  if (!text) return "";
  return text.length > 50 ? text.substring(0, 50) + "..." : text;
}
