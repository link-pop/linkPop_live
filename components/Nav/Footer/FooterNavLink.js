"use client";

import { add, getAll } from "@/lib/actions/crud";
import capitalize from "@/lib/utils/capitalize";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FooterNavLink({ col, linkClassName }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function getLink() {
    if (isLoading) return;
    setIsLoading(true);

    const collection = await getAll({ col });
    let targetId;

    if (collection.length === 0) {
      const created = await add({ col, text: "Terms of Service" });
      targetId = created._id;
    } else {
      targetId = collection[0]._id;
    }

    setIsLoading(false);
    return `/${col.name}/${targetId}`;
  }

  return (
    <Link
      href="#"
      onClick={async (e) => {
        e.preventDefault();
        const href = await getLink();
        if (href) router.push(href);
      }}
      className={`${col.name} ${linkClassName} ${
        isLoading ? "opacity-50" : ""
      }`}
    >
      {capitalize(col?.settings?.displayName || col.name)}
    </Link>
  );
}
