"use client";

import ReviewIcon from "@/components/Review/ReviewIcon";
import HeaderDropdownIcon from "@/components/Nav/Header/HeaderDropdownIcon";

export default function HeaderReviewIcon({ cols, className = "" }) {
  return (
    <HeaderDropdownIcon
      Icon={ReviewIcon}
      cols={cols}
      filterKey="hasReviews"
      getLinkHref={(name) => `/reviews?reviewed_collection=${name}`}
      className={className}
      menuTitle="Reviews"
    />
  );
}
