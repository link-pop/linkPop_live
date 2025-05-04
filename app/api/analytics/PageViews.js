"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useWriteAnalytics } from "./useWriteAnalytics";
import { ANALYTICS_ROUTE } from "@/lib/utils/constants";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default function PageViews({ mongoUser }) {
  if (!mongoUser?._id) return null; // ! ANALYTICS_DISABLED 1/2 COOLKEYS: record only authed users views to save DB memo
  const pathname = usePathname();

  // * don't show page views on analytics page (they are not recorded there)
  if (pathname.includes(ANALYTICS_ROUTE)) return null;

  const [totalViews, setTotalViews] = useState(0);
  const [todayViews, setTodayViews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  useWriteAnalytics({ mongoUser }); // * to write data to show viewed/not posts
  return null; // ! ANALYTICS_DISABLED 1/2 COOLKEYS

  useEffect(() => {
    const fetchViews = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/analytics/read-analytics?path=${encodeURIComponent(pathname)}`
        );
        const data = await response.json();
        setTotalViews(data.totalViews);
        setTodayViews(data.todayViews);
      } catch (error) {
        console.error("Error fetching page views:", error);
      } finally {
        setIsLoading(false);
      }
    };

    setTimeout(() => {
      fetchViews();
    }, 1000);
  }, [pathname]);

  const className =
    "h20 abounce fcc fwn wsn fz12 text-gray-500 w175 h20 tac mxa hover:underline hover:brand";

  if (isLoading) {
    return <div className="h20"></div>;
    return <Skeleton className={className} />;
  }

  // Don't render anything if we have no views data
  if (!totalViews && !todayViews) return null;

  return (
    <Link href={`${ANALYTICS_ROUTE}/deep`} className={className}>
      <TrendingUp className="h15 w15 mr3" />
      {totalViews?.toLocaleString() || "0"} unique view
      {totalViews !== 1 ? "s" : ""} ({todayViews?.toLocaleString() || "0"}{" "}
      today)
    </Link>
  );
}
