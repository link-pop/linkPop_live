"use client";

import UpdateIcon from "@/components/ui/icons/UpdateIcon";
import Link from "next/link";

export default function PostUpdate({ post, col, iconClassName, customIcon }) {
  return (
    <>
      <Link href={`/update/${col.name}/${post?._id}`}>
        {customIcon || <UpdateIcon className={iconClassName} />}
      </Link>
    </>
  );
}
