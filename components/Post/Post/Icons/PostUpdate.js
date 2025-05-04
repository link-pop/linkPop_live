"use client";

import UpdateIcon from "@/components/ui/icons/UpdateIcon";
import Link from "next/link";
import ReviewCustomPostUpdate from "./Custom/ReviewCustomPostUpdate";

export default function PostUpdate({ post, col, iconClassName, customIcon }) {
  return (
    <>
      {["reviews"].includes(col.name) ? (
        <ReviewCustomPostUpdate {...{ post, col }} />
      ) : (
        <Link href={`/update/${col.name}/${post?._id}`}>
          {customIcon || <UpdateIcon className={iconClassName} />}
        </Link>
      )}
    </>
  );
}
