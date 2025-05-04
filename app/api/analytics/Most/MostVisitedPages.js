"use client";

import { useState } from "react";
import CreatedBy from "@/components/Post/Post/CreatedBy";
import { getPlatformEmoji } from "@/lib/utils/getPlatformInfo";
import Link from "next/link";
import { getBrowserEmoji } from "@/lib/utils/getBrowserInfo";
import { getSystemEmoji } from "@/lib/utils/getSystemInfo";

export default function MostVisitedPages({ analytics }) {
  const [sortField, setSortField] = useState("views");
  const [sortOrder, setSortOrder] = useState("desc");
  const showIcons = localStorage.getItem("showAnalyticIcons") === "true";

  const processedData = analytics.reduce((acc, item) => {
    const {
      path,
      visitorId,
      createdBy,
      countryCode,
      platformType,
      browserType,
      systemType,
    } = item;
    if (!acc[path]) {
      acc[path] = {
        views: 0,
        uniqueVisitors: new Set(),
        visitors: new Map(),
      };
    }
    acc[path].views += 1;
    if (!acc[path].uniqueVisitors.has(visitorId)) {
      acc[path].uniqueVisitors.add(visitorId);
      acc[path].visitors.set(visitorId, {
        createdBy,
        countryCode,
        platformType,
        browserType,
        systemType,
      });
    }
    return acc;
  }, {});

  const tableData = Object.entries(processedData).map(([path, data]) => ({
    path,
    views: data.views,
    uniqueViews: data.uniqueVisitors.size,
    visitors: Array.from(data.visitors.values()),
  }));

  const sortedData = [...tableData].sort((a, b) => {
    const multiplier = sortOrder === "desc" ? -1 : 1;
    return multiplier * (a[sortField] - b[sortField]);
  });

  const toggleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "↕";
    return sortOrder === "desc" ? "↓" : "↑";
  };

  return (
    <>
      <h2 className="text-2xl font-bold px15">Most Visited Pages</h2>
      <div className="mah500 oys p-4 mxa">
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Path
                </th>
                <th
                  className="tac px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort("views")}
                >
                  Total Views {getSortIcon("views")} (
                  {sortedData.reduce((sum, item) => sum + item.views, 0)})
                </th>
                <th
                  className="tac px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort("uniqueViews")}
                >
                  Unique Views {getSortIcon("uniqueViews")} (
                  {sortedData.reduce((sum, item) => sum + item.uniqueViews, 0)})
                </th>
                <th className="tac px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unique Visitors
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedData.map(({ path, views, uniqueViews, visitors }) => (
                <tr
                  key={path}
                  className="tac hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="tal px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[150px] sm:max-w-[350px]">
                    <Link
                      className="brand hover:underline block truncate"
                      href={path}
                    >
                      {path}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {uniqueViews}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="mah110 oys f g10">
                      {visitors.map((visitor, index) => (
                        <div
                          key={index}
                          // ! showAnalyticIcons DESIGN SWITCH
                          className={`f aic g5 br10 p2 ${
                            showIcons ? "border-[1px]" : "border-none"
                          }`}
                        >
                          <CreatedBy
                            createdBy={visitor.createdBy}
                            showName={false}
                          />
                          {/* // ! showAnalyticIcons DESIGN SWITCH */}
                          <div
                            className="fc aic"
                            style={{
                              display: showIcons ? "flex" : "none",
                            }}
                          >
                            <div className="f">
                              {visitor.countryCode && (
                                <img
                                  title={visitor.countryCode}
                                  src={`https://flagcdn.com/w320/${visitor.countryCode.toLowerCase()}.png`}
                                  style={{
                                    width: "15px",
                                    height: "auto",
                                    alignSelf: "center",
                                    marginLeft: 2,
                                    marginRight: 2,
                                  }}
                                />
                              )}
                              {visitor.platformType && (
                                <span title={visitor.platformType}>
                                  {getPlatformEmoji(visitor.platformType)}
                                </span>
                              )}
                            </div>
                            <div className="f">
                              {visitor.browserType && (
                                <span title={visitor.browserType}>
                                  {getBrowserEmoji(visitor.browserType)}
                                </span>
                              )}
                              {visitor.systemType && (
                                <span title={visitor.systemType}>
                                  {getSystemEmoji(visitor.systemType)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {sortedData.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="tac px-6 py-4 text-sm text-gray-900"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
