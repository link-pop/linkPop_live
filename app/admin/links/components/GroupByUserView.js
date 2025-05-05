"use client";

import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { ChevronDown, ChevronRight } from "lucide-react";
import CreatedBy from "@/components/Post/Post/CreatedBy";
import HorizontalTableScroll from "@/components/ui/shared/HorizontalScroll/HorizontalTableScroll";

export default function GroupByUserView({
  data,
  columns,
  isLoading,
  isError,
  error,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  byUser,
  loadingText,
  errorText,
  emptyText,
  loadingMoreText,
  scrollToLoadText,
}) {
  const { ref, inView } = useInView();
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // Load more when bottom is reached, even in byUser mode
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Toggle collapse for a group
  const toggleCollapse = (userName) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [userName]: !prev[userName],
    }));
  };

  // Group items by user when byUser is true
  const groupedItems = byUser
    ? Object.values(
        data.reduce((acc, item) => {
          const userName = item.createdBy?.name || "Unknown";
          if (!acc[userName]) {
            acc[userName] = {
              userName,
              userObj: item.createdBy || null,
              items: [],
            };
          }
          acc[userName].items.push(item);
          return acc;
        }, {})
      )
    : null;

  // Custom row rendering for grouped view
  const renderRow = byUser
    ? (group, index) => {
        const isCollapsed = collapsedGroups[group.userName];
        return (
          <React.Fragment key={index}>
            <tr
              className="bg-muted hover:bg-muted/80 cursor-pointer"
              onClick={() => toggleCollapse(group.userName)}
            >
              <td
                colSpan={columns.length}
                className="p-2 font-semibold text-foreground"
              >
                <div className="flex items-center gap-2">
                  {isCollapsed ? (
                    <ChevronRight size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  {group.userObj ? (
                    <CreatedBy
                      wrapClassName="pen"
                      createdBy={group.userObj}
                      showName={true}
                      nameClassName="p-2 font-semibold text-foreground"
                    />
                  ) : (
                    group.userName
                  )}
                  <span className="text-xs ml-2 text-muted-foreground">
                    ({group.items.length} items)
                  </span>
                </div>
              </td>
            </tr>
            {!isCollapsed &&
              group.items.map((item, itemIndex) => (
                <tr
                  key={`${index}-${itemIndex}`}
                  className="border-b hover:bg-muted/50"
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="p-4">
                      {column.accessor(item)}
                    </td>
                  ))}
                </tr>
              ))}
          </React.Fragment>
        );
      }
    : null;

  if (isLoading) {
    return <div className="p-4 text-center">{loadingText}</div>;
  }

  if (isError) {
    console.error("Error fetching data:", error);
    return <div className="p-4 text-center text-destructive">{errorText}</div>;
  }

  if (!data.length) {
    return <div className="p-4 text-center">{emptyText}</div>;
  }

  return (
    <div className="fc g20">
      <HorizontalTableScroll>
        <table className="w-full bg-background rounded-lg shadow min-w-[800px]">
          <thead>
            <tr className="border-b">
              {columns.map((column, index) => (
                <th key={index} className="p-4 text-left">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {byUser
              ? groupedItems.map((group, index) => renderRow(group, index))
              : data.map((item, index) => (
                  <tr
                    key={item._id || index}
                    className="border-b hover:bg-muted"
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="p-4">
                        {column.accessor(item)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </HorizontalTableScroll>

      {/* Loading indicator and observer element */}
      {hasNextPage && (
        <div ref={ref} className="w-full p-4 text-center text-muted-foreground">
          {isFetchingNextPage ? loadingMoreText : scrollToLoadText}
        </div>
      )}
    </div>
  );
}
