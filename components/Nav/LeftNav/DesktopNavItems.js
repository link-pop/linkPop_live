"use client";

import Link from "next/link";
import NotificationBadge from "@/components/ui/shared/NotificationBadge/NotificationBadge";

export default function DesktopNavItems({
  items,
  getLinkHref,
  isActiveLink,
  mongoUser,
  isExpanded,
  showLabels,
}) {
  if (!items) return null;

  return (
    <div className={`fc g8 wf ${isExpanded ? "" : "items-center"}`}>
      {items.map((item) => (
        <Link
          key={item.id}
          href={getLinkHref(item, mongoUser)}
          className={`f fwn g8 p10 wf rounded-md transition-all duration-300 ease-in-out ${
            isActiveLink(item) ? "bg-muted" : "hover:bg-muted"
          } ${isExpanded ? "" : "fсс"} overflow-hidden`}
        >
          <div className="text-xl flex-shrink-0">{item.icon}</div>
          <span
            className={`transition-all duration-300 ease-in-out whitespace-nowrap ${
              isExpanded
                ? showLabels
                  ? "opacity-100 translate-x-0 max-w-[200px]"
                  : "opacity-0 -translate-x-4 max-w-0"
                : "opacity-0 max-w-0"
            }`}
          >
            {item.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
