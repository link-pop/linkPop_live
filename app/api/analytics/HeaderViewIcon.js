"use client";

import Link from "next/link";
import ViewIcon from "../../../components/ui/icons/ViewIcon";
import HeaderDropdownIcon from "@/components/Nav/Header/HeaderDropdownIcon";
import { ANALYTICS_ROUTE } from "@/lib/utils/constants";

export default function HeaderViewIcon({ cols, className = "" }) {
  return (
    <HeaderDropdownIcon
      Icon={ViewIcon}
      cols={cols}
      filterKey="hasViews"
      getLinkHref={(name) => `/${name}?viewed=true`}
      className={className}
      menuTitle="Views"
      // ! ANALYTICS_DISABLED 1/2 COOLKEYS
      // top={
      //   <Link className={className} href={`${ANALYTICS_ROUTE}/deep`}>
      //     Analytics
      //   </Link>
      // }
      // top2={
      //   <Link className={className} href={ANALYTICS_ROUTE}>
      //     History
      //   </Link>
      // }
    />
  );
}
