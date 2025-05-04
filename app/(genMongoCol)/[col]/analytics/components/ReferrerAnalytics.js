"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function ReferrerAnalytics({ visitors, isDemoMode = false }) {
  const [referrerData, setReferrerData] = useState([]);
  const { t } = useTranslation();

  // ! code start demo data
  const getDemoReferrerData = () => {
    if (!isDemoMode) return null;

    // Create realistic demo data for referrers
    return [
      { source: "Google", count: 167 },
      { source: "Direct", count: 98 },
      { source: "Instagram", count: 76 },
      { source: "Facebook", count: 54 },
      { source: "Twitter", count: 41 },
      { source: "TikTok", count: 29 },
      { source: "YouTube", count: 19 },
      { source: "LinkedIn", count: 11 },
      { source: "Pinterest", count: 5 },
    ];
  };
  // ? code end demo data

  useEffect(() => {
    if ((!visitors || visitors.length === 0) && !isDemoMode) return;

    // If in demo mode, use demo data
    if (isDemoMode) {
      const demoData = getDemoReferrerData();
      if (demoData) {
        setReferrerData(demoData);
        return;
      }
    }

    // Group visitors by referrer
    const referrers = {};
    visitors.forEach((visitor) => {
      let referrer = visitor.referrer || "Direct";

      // Clean up referrer URLs
      try {
        if (referrer !== "Direct") {
          const url = new URL(referrer);
          referrer = url.hostname;
        }
      } catch (e) {
        // If URL parsing fails, use the original string
      }

      if (!referrers[referrer]) {
        referrers[referrer] = {
          source: referrer,
          count: 0,
        };
      }
      referrers[referrer].count++;
    });

    // Convert to array and sort by count
    const referrersArray = Object.values(referrers).sort(
      (a, b) => b.count - a.count
    );
    setReferrerData(referrersArray);
  }, [visitors, isDemoMode]);

  if ((!visitors || visitors.length === 0) && !isDemoMode) {
    return (
      <div className="text-center p-4">
        <h2 className="text-xl font-semibold mb-4">{t("referrerSources")}</h2>
        {t("noReferrerData")}
      </div>
    );
  }

  // Calculate total visitors for percentage calculation
  const totalVisits = isDemoMode
    ? referrerData.reduce((sum, item) => sum + item.count, 0)
    : visitors
    ? visitors.length
    : 0;

  return (
    <div className="bg-accent overflow-hidden">
      <h2 className="text-xl font-semibold mb-4">{t("referrerSources")}</h2>
      <div className="overflow-x-auto max-h-64">
        <table className="bg-accent w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="bg-accent px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2"
              >
                {t("source")}
              </th>
              <th
                scope="col"
                className="bg-accent px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
              >
                {t("visits")}
              </th>
              <th
                scope="col"
                className="bg-accent px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
              >
                %
              </th>
            </tr>
          </thead>
          <tbody className="bg-accent divide-y divide-gray-200">
            {referrerData.map((referrer, idx) => (
              <tr key={idx}>
                <td className="px-3 py-4 whitespace-nowrap overflow-hidden text-ellipsis">
                  <span className="truncate block">{referrer.source}</span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  {referrer.count}
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  {Math.round((referrer.count / totalVisits) * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
