"use client";

import { usePathname } from "next/navigation";
import StoreitemsTypeSwitch from "../MoreThanFriend/StoreitemsTypeSwitch";
import { STOREITEMS_ROUTE } from "@/lib/utils/constants";

export default function StoreitemsPostsTopCustomContent({ col, mongoUser }) {
  const pathname = usePathname();
  if (pathname !== STOREITEMS_ROUTE) return null;
  if (col.name !== "storeitems") return null;

  return (
    <div className={`wf`}>
      <StoreitemsTypeSwitch {...{ mongoUser }} />
    </div>
  );
}
