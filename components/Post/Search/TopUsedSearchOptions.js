"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowUp as Up,
  ArrowDown as Down,
  Heart,
  HeartOff,
  Eye,
  EyeOff,
} from "lucide-react";
import SortToggle from "./SortToggle";
import { TopUsedSortOptions } from "./TopUsedSortOptions";
import { TopUsedFilterOptions } from "./TopUsedFilterOptions";

export default function TopUsedSearchOptions({ col }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSort = (sortValue) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", sortValue);
    router.push(`?${params.toString()}`);
  };

  const handleLiked = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set("liked", value);
    router.push(`?${params.toString()}`);
  };

  const handleViewed = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set("viewed", value);
    router.push(`?${params.toString()}`);
  };

  const handleDelete = (param) => {
    const params = new URLSearchParams(searchParams);
    params.delete(param);
    router.push(`?${params.toString()}`);
  };

  const currentSort = searchParams.get("sort");
  const currentLiked = searchParams.get("liked");
  const currentViewed = searchParams.get("viewed");

  const hasSort = searchParams.has("sort");
  const hasLiked = searchParams.has("liked");
  const hasViewed = searchParams.has("viewed");

  return (
    <div className="fcc g8 wf">
      {/* // ! FAKE buttons (x2) that show REAL SortButton and disappear after 1st click */}
      <TopUsedSortOptions
        col={col}
        currentSort={currentSort}
        handleSort={handleSort}
        hasSort={hasSort}
      />

      <TopUsedFilterOptions
        col={col}
        currentFilters={{ liked: currentLiked, viewed: currentViewed }}
        handleFilter={(key, value) => {
          if (key === "liked") handleLiked(value);
          if (key === "viewed") handleViewed(value);
        }}
        hasFilter={hasLiked || hasViewed}
      />

      {/* // ! REAL SortButtons (x2) that execute sorting  */}
      {hasLiked && (
        <SortToggle
          icon={currentLiked === "true" ? Heart : HeartOff}
          text={currentLiked === "true" ? "I Liked" : "Not Liked"}
          onClick={() =>
            handleLiked(currentLiked === "true" ? "false" : "true")
          }
          hasFilter={hasLiked}
          onDeleteFilter={() => handleDelete("liked")}
        />
      )}

      {hasViewed && (
        <SortToggle
          icon={currentViewed === "true" ? Eye : EyeOff}
          text={currentViewed === "true" ? "I Viewed" : "Not Viewed"}
          onClick={() =>
            handleViewed(currentViewed === "true" ? "false" : "true")
          }
          hasFilter={hasViewed}
          onDeleteFilter={() => handleDelete("viewed")}
        />
      )}
    </div>
  );
}
