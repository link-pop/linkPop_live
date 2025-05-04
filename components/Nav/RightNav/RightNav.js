"use client";

import { usePathname } from "next/navigation";
import { LOGIN_ROUTE } from "@/lib/utils/constants";

export default function RightNav() {
  return null;
  const pathname = usePathname();

  return (
    pathname !== LOGIN_ROUTE && (
      <div className="bw1 maw400 wf flex flex-col h-screen p-4 space-y-2 bg-white"></div>
    )
  );
}
