"use client";

import { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import { Calendar, ChevronDown, TrendingUp } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useQuery } from "@tanstack/react-query";
import { getSocialMediaLinks } from "@/lib/actions/getSocialMediaLinks";

// ! code start chart theme colors
const chartColors = {
  primary: "#FB75CC", // Hardcoded brand color
  primaryGradientStart: "rgba(251, 117, 204, 0.8)", // Brand color with opacity
  primaryGradientEnd: "rgba(251, 117, 204, 0.05)", // Brand color with low opacity
  secondary: "#8b5cf6", // Purple
  secondaryGradientStart: "rgba(139, 92, 246, 0.8)",
  secondaryGradientEnd: "rgba(139, 92, 246, 0.1)",
  accent: "#0ea5e9", // Sky blue
  accentGradientStart: "rgba(14, 165, 233, 0.8)",
  accentGradientEnd: "rgba(14, 165, 233, 0.1)",
  grid: "rgba(156, 163, 175, 0.08)",
  text: "rgba(156, 163, 175, 0.9)",
  borderColor: "rgba(156, 163, 175, 0.12)",
};
// ? code end chart theme colors

export default function VisitorTimeline({
  visitors,
  profileId,
  landingPageId = null,
  isDemoMode = false,
  demoLinks = [],
  hideClicks = false,
}) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [timeframe, setTimeframe] = useState("last30Days"); // Default to last 30 days
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { t } = useTranslation();

  // Fetch click data using React Query (only if not in demo mode)
  const { data: fetchedLinks = [], isLoading: isLoadingLinks } = useQuery({
    queryKey: ["socialMediaLinks", profileId, landingPageId],
    queryFn: () => getSocialMediaLinks(profileId, landingPageId),
    enabled: !!profileId && !isDemoMode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use either demo links or fetched links
  const links = isDemoMode ? demoLinks : fetchedLinks;
  const isLoading = !isDemoMode && isLoadingLinks;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Define time ranges with display names and processing logic
  const timeRanges = {
    today: {
      label: t("today"),
      getRange: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return { start: today, hourly: true };
      },
    },
    yesterday: {
      label: t("yesterday"),
      getRange: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        return { start: yesterday, hourly: true };
      },
    },
    last7Days: {
      label: t("last7Days"),
      getRange: () => {
        const start = new Date();
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        return { start, hourly: false };
      },
    },
    last30Days: {
      label: t("last30Days"),
      getRange: () => {
        const start = new Date();
        start.setDate(start.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        return { start, hourly: false };
      },
    },
    currentMonth: {
      label: t("currentMonth"),
      getRange: () => {
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        return { start, hourly: false };
      },
    },
    lastMonth: {
      label: t("lastMonth"),
      getRange: () => {
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setDate(0); // Last day of previous month
        end.setHours(23, 59, 59, 999);

        return { start, end, hourly: false };
      },
    },
    currentYear: {
      label: t("currentYear"),
      getRange: () => {
        const start = new Date();
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        return { start, hourly: false };
      },
    },
    lastYear: {
      label: t("lastYear"),
      getRange: () => {
        const start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setFullYear(end.getFullYear() - 1);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);

        return { start, end, hourly: false };
      },
    },
    allTime: {
      label: t("allTime"),
      getRange: () => {
        return { allTime: true, hourly: false };
      },
    },
  };

  // ! code start create chart function
  const createChart = (ctx, labels, visitCounts, clickCounts, title) => {
    // Create gradient for chart background - visitors
    const visitsGradientFill = ctx.createLinearGradient(0, 0, 0, 350);
    visitsGradientFill.addColorStop(0, chartColors.primaryGradientStart);
    visitsGradientFill.addColorStop(1, chartColors.primaryGradientEnd);

    // Create gradient for chart background - clicks
    const clicksGradientFill = ctx.createLinearGradient(0, 0, 0, 350);
    clicksGradientFill.addColorStop(0, chartColors.secondaryGradientStart);
    clicksGradientFill.addColorStop(1, chartColors.secondaryGradientEnd);

    // Create line gradient for the visits line
    const visitsLineGradient = ctx.createLinearGradient(
      0,
      0,
      ctx.canvas.width,
      0
    );
    visitsLineGradient.addColorStop(0, chartColors.primary);
    visitsLineGradient.addColorStop(1, chartColors.secondary);

    // Create line gradient for the clicks line
    const clicksLineGradient = ctx.createLinearGradient(
      0,
      0,
      ctx.canvas.width,
      0
    );
    clicksLineGradient.addColorStop(0, chartColors.secondary);
    clicksLineGradient.addColorStop(1, chartColors.accent);

    // Create shadow for the line
    const shadowColor = "rgba(0, 0, 0, 0.07)";
    const shadowOffsetX = 0;
    const shadowOffsetY = 4;
    const shadowBlur = 6;

    // Create plugin for shadow effect
    const shadowPlugin = {
      id: "shadow",
      beforeDraw: (chart) => {
        const { ctx } = chart;
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;
      },
      afterDraw: (chart) => {
        const { ctx } = chart;
        ctx.shadowColor = "rgba(0, 0, 0, 0)";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      },
    };

    // Determine max for y-axis scaling
    const maxVisits = Math.max(...visitCounts);
    const maxClicks = hideClicks ? 0 : Math.max(...clickCounts);
    const max = Math.max(maxVisits, maxClicks);
    const stepSize = max <= 10 ? 1 : Math.ceil(max / 10);

    return new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Visits",
            data: visitCounts,
            borderWidth: 3,
            borderColor: visitsLineGradient,
            backgroundColor: visitsGradientFill,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: chartColors.secondary,
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: chartColors.accent,
            pointHoverBorderColor: "#fff",
            pointHoverBorderWidth: 3,
            cubicInterpolationMode: "monotone",
            order: 1,
          },
          // Only include clicks dataset if hideClicks is false
          ...(!hideClicks
            ? [
                {
                  label: "Clicks",
                  data: clickCounts,
                  borderWidth: 3,
                  borderColor: clicksLineGradient,
                  backgroundColor: clicksGradientFill,
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: chartColors.accent,
                  pointBorderColor: "#fff",
                  pointBorderWidth: 2,
                  pointRadius: 5,
                  pointHoverRadius: 8,
                  pointHoverBackgroundColor: chartColors.primary,
                  pointHoverBorderColor: "#fff",
                  pointHoverBorderWidth: 3,
                  cubicInterpolationMode: "monotone",
                  order: 2,
                },
              ]
            : []),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1500,
          easing: "easeOutQuint",
        },
        layout: {
          padding: {
            top: 25,
            right: 25,
            bottom: 15,
            left: 15,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: chartColors.grid,
              drawBorder: false,
              drawTicks: false,
            },
            ticks: {
              stepSize: stepSize,
              precision: 0,
              color: chartColors.text,
              font: {
                size: 12,
                weight: "500",
              },
              padding: 12,
              callback: function (value) {
                if (value === 0) return 0;
                if (value >= 1000) return (value / 1000).toFixed(0) + "k";
                return value;
              },
            },
            border: {
              display: false,
            },
          },
          x: {
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: chartColors.text,
              font: {
                size: 12,
                weight: "500",
              },
              maxRotation: 45,
              minRotation: 0,
              padding: 10,
              autoSkip: true,
              maxTicksLimit: 15,
            },
            border: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              usePointStyle: true,
              padding: 16,
              font: {
                size: 12,
                weight: "500",
              },
            },
          },
          tooltip: {
            backgroundColor: "rgba(17, 24, 39, 0.9)",
            titleFont: {
              size: 14,
              weight: "bold",
            },
            bodyFont: {
              size: 13,
            },
            padding: 12,
            borderColor: chartColors.primaryGradientStart,
            borderWidth: 2,
            displayColors: true,
            cornerRadius: 8,
            caretSize: 6,
            caretPadding: 10,
            callbacks: {
              title: function (context) {
                return context[0].label;
              },
              label: function (context) {
                const value = context.parsed.y;
                const datasetLabel = context.dataset.label;
                return `${datasetLabel}: ${value} ${
                  value !== 1 ? "events" : "event"
                }`;
              },
            },
          },
          title: {
            display: true,
            text: title,
            color: chartColors.text,
            font: {
              size: 16,
              weight: "bold",
              family: "system-ui, sans-serif",
            },
            padding: {
              bottom: 20,
            },
          },
        },
        interaction: {
          mode: "index",
          intersect: false,
        },
        hover: {
          mode: "nearest",
          intersect: true,
        },
      },
      plugins: [shadowPlugin],
    });
  };
  // ? code end create chart function

  useEffect(() => {
    // Don't proceed if we don't have visitors or links aren't loaded yet
    if (!visitors || visitors.length === 0 || isLoading) return;

    // Process data based on selected timeframe
    const range = timeRanges[timeframe].getRange();
    const isHourly = range.hourly;

    let filteredVisitors = visitors;

    // Changed approach: Extract individual click events from links
    // Rather than treating all clicks as occurring at the link creation time
    const allClickEvents = [];

    links.forEach((link) => {
      // If there are explicit clickTimestamps, use those
      if (link.clickHistory && Array.isArray(link.clickHistory)) {
        // Use actual click history timestamps
        link.clickHistory.forEach((clickEvent) => {
          allClickEvents.push({
            date: new Date(
              clickEvent.timestamp || clickEvent.date || clickEvent.createdAt
            ),
          });
        });
      } else if (link.clickCount && link.clickCount > 0) {
        // If we only have clickCount but no timestamps, we need to estimate
        // For better visualization, distribute clicks evenly across the time period
        // from link creation to now
        const clickCount = link.clickCount;
        const startDate = new Date(link.createdAt);
        const endDate = new Date(); // current time

        // Only try to distribute if there's a meaningful time range
        const timeRange = endDate - startDate;
        if (timeRange > 0 && clickCount > 1) {
          const intervalMs = timeRange / (clickCount - 1);

          for (let i = 0; i < clickCount; i++) {
            const clickTime = new Date(startDate.getTime() + i * intervalMs);
            allClickEvents.push({ date: clickTime });
          }
        } else {
          // If only one click or created just now, just use creation date
          allClickEvents.push({ date: startDate });
        }
      }
    });

    let periods = [];
    let periodFormat = {};
    let groupingFn;

    // Filter visitors based on selected time range
    if (!range.allTime) {
      const endDate = range.end || new Date();
      filteredVisitors = visitors.filter((visitor) => {
        const visitDate = new Date(visitor.createdAt);
        return visitDate >= range.start && visitDate <= endDate;
      });
    }

    // For empty filtered results, show an empty chart
    if (filteredVisitors.length === 0 && allClickEvents.length === 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = createChart(
        ctx,
        ["No data"],
        [0],
        [0],
        `No activity during this period`
      );
      return;
    }

    // Handle hourly view for Today or Yesterday
    if (isHourly) {
      // Create 24 hour periods
      for (let hour = 0; hour < 24; hour++) {
        const date = new Date(range.start);
        date.setHours(hour, 0, 0, 0);
        periods.push(date);
      }

      periodFormat = { hour: "numeric", hour12: true };
      groupingFn = (date) => {
        const visitDate = new Date(date);
        visitDate.setMinutes(0, 0, 0);
        return visitDate.getTime();
      };
    }
    // Handle different date-based ranges
    else if (timeframe === "last7Days") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        periods.push(date);
      }
      periodFormat = { weekday: "short" };
      groupingFn = (date) => {
        const visitDate = new Date(date);
        visitDate.setHours(0, 0, 0, 0);
        return visitDate.getTime();
      };
    } else if (timeframe === "last30Days") {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        periods.push(date);
      }
      periodFormat = { month: "short", day: "numeric" };
      groupingFn = (date) => {
        const visitDate = new Date(date);
        visitDate.setHours(0, 0, 0, 0);
        return visitDate.getTime();
      };
    } else if (timeframe === "currentMonth" || timeframe === "lastMonth") {
      // Current or last month - show all days in the month
      const startDate = new Date(range.start);
      const endDate = range.end || new Date();

      // Get all days in the month
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        periods.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      periodFormat = { day: "numeric" };
      groupingFn = (date) => {
        const visitDate = new Date(date);
        visitDate.setHours(0, 0, 0, 0);
        return visitDate.getTime();
      };
    } else if (timeframe === "currentYear" || timeframe === "lastYear") {
      // Current or last year - show by month
      const year = range.start.getFullYear();
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 1);
        periods.push(date);
      }

      periodFormat = { month: "short" };
      groupingFn = (date) => {
        const visitDate = new Date(date);
        visitDate.setDate(1);
        visitDate.setHours(0, 0, 0, 0);
        return visitDate.getTime();
      };
    } else if (timeframe === "allTime") {
      // All time - group by month
      if (filteredVisitors.length > 0 || allClickEvents.length > 0) {
        // Find the earliest and latest dates
        let earliestDate = new Date();
        let latestDate = new Date(0); // January 1, 1970

        // Check visitors data
        if (filteredVisitors.length > 0) {
          filteredVisitors.forEach((visitor) => {
            const visitDate = new Date(visitor.createdAt);
            if (visitDate < earliestDate) earliestDate = visitDate;
            if (visitDate > latestDate) latestDate = visitDate;
          });
        }

        // Check click events
        allClickEvents.forEach((clickEvent) => {
          const clickDate = clickEvent.date;
          if (clickDate < earliestDate) earliestDate = clickDate;
          if (clickDate > latestDate) latestDate = clickDate;
        });

        // Create periods by month between earliest and latest
        let currentDate = new Date(earliestDate);
        currentDate.setDate(1); // Start at first day of month

        while (currentDate <= latestDate) {
          periods.push(new Date(currentDate));
          currentDate.setMonth(currentDate.getMonth() + 1);
        }

        periodFormat = { year: "numeric", month: "short" };
        groupingFn = (date) => {
          const visitDate = new Date(date);
          visitDate.setDate(1);
          visitDate.setHours(0, 0, 0, 0);
          return visitDate.getTime();
        };
      }
    }

    // Group visits by period
    const visitCounts = [];
    const clickCounts = [];
    const visitPeriodMap = new Map();
    const clickPeriodMap = new Map();

    // Initialize period maps
    periods.forEach((period) => {
      visitPeriodMap.set(period.getTime(), 0);
      clickPeriodMap.set(period.getTime(), 0);
    });

    // Count visits for each period
    filteredVisitors.forEach((visitor) => {
      const visitDate = new Date(visitor.createdAt);
      const periodKey = groupingFn(visitDate);

      if (visitPeriodMap.has(periodKey)) {
        visitPeriodMap.set(periodKey, visitPeriodMap.get(periodKey) + 1);
      }
    });

    // Count clicks for each period using individual click events
    if (!hideClicks) {
      // Filter click events by the selected date range if not using allTime
      const filteredClickEvents = range.allTime
        ? allClickEvents
        : allClickEvents.filter(
            (clickEvent) =>
              clickEvent.date >= range.start &&
              clickEvent.date <= (range.end || new Date())
          );

      // Count clicks by period
      filteredClickEvents.forEach((clickEvent) => {
        const periodKey = groupingFn(clickEvent.date);

        if (clickPeriodMap.has(periodKey)) {
          clickPeriodMap.set(periodKey, clickPeriodMap.get(periodKey) + 1);
        }
      });
    }

    // Convert to arrays for Chart.js
    periods.forEach((period) => {
      visitCounts.push(visitPeriodMap.get(period.getTime()));
      clickCounts.push(clickPeriodMap.get(period.getTime()));
    });

    // Format periods for the x-axis
    const labels = periods.map((date) =>
      date.toLocaleString("en-US", periodFormat)
    );

    // If a chart already exists, destroy it
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create a new chart with our improved function that includes both datasets
    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = createChart(
      ctx,
      labels,
      visitCounts,
      clickCounts,
      timeRanges[timeframe].label
    );

    // Clean up
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [visitors, links, timeframe, isLoading]);

  if (
    (!visitors || visitors.length === 0) &&
    (!links || links.every((link) => !link.clickCount))
  ) {
    return (
      <div
        className={`text-center p-6 bg-background rounded-lg border border-border shadow-sm`}
      >
        <h2 className="text-xl font-semibold mb-4 text-foreground">
          {t("activityTimeline")}
        </h2>
        <div className="py-12 text-muted-foreground">{t("noActivityData")}</div>
      </div>
    );
  }

  return (
    <div
      className={`bg-background rounded-lg border border-border shadow-md p-6 transition-all duration-300 hover:shadow-lg`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2
          className={`text-xl font-semibold text-foreground flex items-center mb-4 md:mb-0`}
        >
          <TrendingUp size={20} className="mr-2 text-primary" />
          {t("activityTimeline")}
        </h2>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center px-4 py-2 border rounded-md bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors duration-200 shadow-sm`}
          >
            <Calendar size={16} className="mr-2 text-primary" />
            {timeRanges[timeframe].label}
            <ChevronDown size={16} className="ml-2 text-muted-foreground" />
          </button>

          {showDropdown && (
            <div
              className={`absolute top-full right-0 mt-1 w-56 rounded-md shadow-lg bg-popover ring-1 ring-border ring-opacity-5 z-10 divide-y divide-border overflow-hidden`}
            >
              <div className="py-1">
                <button
                  onClick={() => {
                    setTimeframe("today");
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150`}
                >
                  {t("today")}
                </button>
                <button
                  onClick={() => {
                    setTimeframe("yesterday");
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150`}
                >
                  {t("yesterday")}
                </button>
                <button
                  onClick={() => {
                    setTimeframe("last7Days");
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150`}
                >
                  {t("last7Days")}
                </button>
                <button
                  onClick={() => {
                    setTimeframe("last30Days");
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150`}
                >
                  {t("last30Days")}
                </button>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setTimeframe("currentMonth");
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150`}
                >
                  {t("currentMonth")}
                </button>
                <button
                  onClick={() => {
                    setTimeframe("lastMonth");
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150`}
                >
                  {t("lastMonth")}
                </button>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setTimeframe("currentYear");
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150`}
                >
                  {t("currentYear")}
                </button>
                <button
                  onClick={() => {
                    setTimeframe("lastYear");
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150`}
                >
                  {t("lastYear")}
                </button>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setTimeframe("allTime");
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150`}
                >
                  {t("allTime")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`h-80 mt-2`}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
