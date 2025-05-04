"use client";

import capitalize from "@/lib/utils/capitalize";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// * title + search icon
export default function PostsSearchButton({ col }) {
  const pathname = usePathname();
  const isInColPage = pathname === `/${col.name}`; // eg: /products

  const onNavClickScroll = col.settings?.onNavClickScroll;
  const title = capitalize(col.settings?.displayName || col.name);

  if (onNavClickScroll) {
    return (
      // skip rendering Link that leads to col page
      // need id to scroll to this col posts section title
      <div className="fcc g10 t_1 tac pen" id={col.name}>
        <div className="title">{title}</div>
      </div>
    );
  }

  return (
    <Link
      className={`fcc g10 t_1 tac ${isInColPage ? "pen" : ""}`}
      onClick={() => {
        setTimeout(() => {
          document.querySelector(".PostsSearchBtn")?.click();
        }, 1000);
      }}
      href={`/${col.name}`}
    >
      <div className="title">{title}</div>
      <Search />
    </Link>
  );
}
