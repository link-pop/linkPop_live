"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DropdownIcon from "@/components/ui/shared/DropdownIcon/DropdownIcon";

export default function HeaderDropdownIcon({
  Icon,
  cols,
  filterKey,
  getLinkHref,
  className = "",
  menuTitle,
  top,
  top2,
}) {
  const router = useRouter();

  // ! generated headerMenuLinks
  const headerMenuLinks =
    cols?.filter((col) => col.settings?.[filterKey] === true) || [];
  // ! reverse headerMenuLinks order: eg: products, articles
  headerMenuLinks?.reverse();

  // * menuLinkClassName
  const menuLinkClassName = "block px-4 py-2 text-sm text-foreground hover:bg-accent";

  return (
    <DropdownIcon
      iconClassName={iconClassName}
      Icon={Icon}
      menuTitle={menuTitle}
      top={top}
      top2={top2}
    >
      {headerMenuLinks.map((col) => (
        <Link
          key={col.name}
          href={getLinkHref(col.name)}
          className={menuLinkClassName}
          onClick={(e) => {
            e.preventDefault();
            const href = e.currentTarget.href;
            router.push(href);
          }}
        >
          {col.name.charAt(0).toUpperCase() + col.name.slice(1)}
        </Link>
      ))}
      {headerMenuLinks.length === 0 && (
        <span className="block px-4 py-2 text-sm text-muted-foreground">
          No collections
        </span>
      )}
    </DropdownIcon>
  );
}
