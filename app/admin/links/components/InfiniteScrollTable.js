"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

/**
 * A reusable component for infinite scroll pagination with a table
 * @param {Object} props
 * @param {Array} props.data - The data to display in the table
 * @param {Array} props.columns - Array of column definitions with header and accessor
 * @param {boolean} props.isLoading - Whether data is loading
 * @param {boolean} props.isError - Whether there was an error
 * @param {Error} props.error - The error object if isError is true
 * @param {boolean} props.hasNextPage - Whether there are more pages to load
 * @param {boolean} props.isFetchingNextPage - Whether the next page is being fetched
 * @param {Function} props.fetchNextPage - Function to fetch the next page
 * @param {string} props.title - Title for the table
 * @param {string} props.loadingText - Text to show when loading
 * @param {string} props.errorText - Text to show when there's an error
 * @param {string} props.emptyText - Text to show when there's no data
 * @param {string} props.loadingMoreText - Text to show when loading more data
 * @param {string} props.scrollToLoadText - Text to show when ready to load more
 * @param {Function} props.renderRow - Optional function to render a custom row
 */
// TODO: !!!!!!!! DELETE THIS FILE !!!!!!!!
export default function InfiniteScrollTable({
  data = [],
  columns = [],
  isLoading,
  isError,
  error,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  title,
  loadingText = "Loading...",
  errorText = "Failed to load data",
  emptyText = "No data found",
  loadingMoreText = "Loading more...",
  scrollToLoadText = "Scroll to load more",
  renderRow,
}) {
  const { ref, inView } = useInView();

  // Load more when bottom is reached
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}

      <div className="overflow-x-auto">
        <table className="w-full bg-background rounded-lg shadow">
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
            {renderRow
              ? data.map((item, index) => renderRow(item, index))
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
      </div>

      {/* Loading indicator and observer element */}
      {hasNextPage && (
        <div ref={ref} className="w-full p-4 text-center text-muted-foreground">
          {isFetchingNextPage ? loadingMoreText : scrollToLoadText}
        </div>
      )}
    </div>
  );
}
