"use client";

import LikeIcon from "@/components/Like/LikeIcon";
import HeaderDropdownIcon from "@/components/Nav/Header/HeaderDropdownIcon";

export default function HeaderLikeIcon({ cols, className = "" }) {
  return (
    <HeaderDropdownIcon
      Icon={LikeIcon}
      cols={cols}
      filterKey="hasLikes"
      getLinkHref={(name) => `/${name}?liked=true`}
      className={className}
      menuTitle="Likes"
    />
  );
}
