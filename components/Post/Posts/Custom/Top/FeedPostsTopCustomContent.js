"use client";

import { usePathname } from "next/navigation";
import FeedTypeSwitch from "../MoreThanFriend/FeedTypeSwitch";

export default function FeedPostsTopCustomContent({ col, mongoUser }) {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  if (col.name !== "feeds") return null;

  return (
    <div className={`wf`}>
      <FeedTypeSwitch {...{ mongoUser }} />
    </div>
  );
}
