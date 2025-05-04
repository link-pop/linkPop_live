"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminPageHeader({ actionLink, actionText, actions }) {
  const pathname = usePathname();

  // Define available admin pages and their titles
  const adminPages = [
    {
      link: "/admin/subscriptions",
      text: "subscriptions",
      title: "Admin Subscriptions",
    },
    { link: "/admin/referrals", text: "referrals", title: "Admin Referrals" },
    { link: "/admin/clicks", text: "clicks", title: "Admin Clicks" },
    { link: "/admin/links", text: "links", title: "Admin Links" },
    { link: "/admin/analytics", text: "analytics", title: "Admin Analytics" },
  ];

  // Use provided actions or default to admin pages
  const allActions = actions || adminPages;

  // Find current page to determine title
  const currentPage = adminPages.find((page) =>
    pathname.includes(page.link)
  ) || { title: "Admin" };

  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4 md:mb-6">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">
        {currentPage.title}
      </h1>
      {allActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allActions.map((action, index) => {
            const isActive = pathname.includes(action.link);
            return (
              <Link
                key={index}
                href={action.link}
                className={`inline-flex items-center rounded-md px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm font-medium md:font-semibold ring-1 ring-inset ring-gray-300 transition-colors duration-200 ease-in-out text-foreground ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-accent"
                }`}
              >
                View {action.text}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
