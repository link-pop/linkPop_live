"use client";

import { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import { Calendar, ChevronDown, TrendingUp, Check } from "lucide-react";
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
  const { t, currentLang } = useTranslation();
  // State for custom legend visibility
  const [visitsVisible, setVisitsVisible] = useState(true);
  const [clicksVisible, setClicksVisible] = useState(true);

  // Use the current language for date formatting
  const userLocale = currentLang || "en";

  // Toggle dataset visibility
  const toggleDataset = (datasetIndex) => {
    if (!chartInstance.current || typeof window === "undefined") return;

    const meta = chartInstance.current.getDatasetMeta(datasetIndex);
    if (!meta) return;

    meta.hidden = !meta.hidden;

    if (datasetIndex === 0) {
      setVisitsVisible(!meta.hidden);
    } else if (datasetIndex === 1) {
      setClicksVisible(!meta.hidden);
    }

    chartInstance.current.update();
  };

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

  // Define countries that use 12-hour time format (AM/PM)
  const twelveHourTimeCountries = [
    "en", // English (US, UK, etc.)
    "es-US", // Spanish (US)
    "fil", // Filipino
    "hi", // Hindi
    "ar", // Arabic
    "bn", // Bengali
    "fa", // Persian
    "gu", // Gujarati
    "mr", // Marathi
    "my", // Burmese
    "ne", // Nepali
    "pa", // Punjabi
    "ta", // Tamil
    "ur", // Urdu
  ];

  // Check if the current language uses 12-hour time format
  const uses12HourFormat = twelveHourTimeCountries.includes(currentLang);

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

    // Custom plugin for title alignment only, since we're using custom HTML legend
    const customTitlePlugin = {
      id: "customTitlePlugin",
      beforeInit: (chart) => {
        // For mobile screens, update alignment
        if (window.innerWidth < 768) {
          // Set the title to start (left-aligned)
          if (chart.options.plugins.title) {
            chart.options.plugins.title.align = "start";
          }
        }
      },
    };

    // Determine max for y-axis scaling
    const maxVisits = Math.max(...visitCounts);
    const maxClicks = hideClicks ? 0 : Math.max(...clickCounts);
    const max = Math.max(maxVisits, maxClicks);
    const stepSize = max <= 10 ? 1 : Math.ceil(max / 10);

    // Use translated labels for datasets
    const visitsLabel = t("visits");
    const clicksLabel = t("clicks");

    // For month view with many days, ensure all labels are visible
    const shouldShowAllLabels = labels.length <= 31;

    // Calculate minimum width needed to display all labels properly
    // Make sure there's at least 40px per label on mobile to avoid cramping
    const minWidth = Math.max(labels.length * 40, 300);

    return new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: visitsLabel,
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
                  label: clicksLabel,
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
            top: 20, // Reduced top padding since we're using custom HTML legend
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
              autoSkip: false, // Show all labels on x-axis
              maxTicksLimit: 1000, // Allow all labels to be shown
            },
            border: {
              display: false,
            },
          },
        },
        plugins: {
          // Using custom HTML legend instead of Chart.js legend
          legend: {
            display: false, // Hide the built-in legend since we're using custom HTML legend
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
                return `${datasetLabel}: ${value}`;
              },
            },
          },
          title: {
            display: true,
            text: title,
            align: window.innerWidth < 768 ? "start" : "center", // Left-align on mobile
            color: chartColors.text,
            font: {
              size: 16,
              weight: "bold",
              family: "system-ui, sans-serif",
            },
            padding: {
              top: 10,
              bottom: 20, // Reduced since we have custom legend with its own spacing
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
      plugins: [shadowPlugin, customTitlePlugin],
    });
  };
  // ? code end create chart function

  useEffect(() => {
    // Safety check for server-side rendering or missing ref
    if (!chartRef.current || typeof window === "undefined") {
      return;
    }

    // Don't proceed if we don't have visitors or links aren't loaded yet
    if ((!visitors || visitors.length === 0) && !isDemoMode && isLoading)
      return;

    // Add responsive listener to update chart alignment when window size changes
    const handleResize = () => {
      if (chartInstance.current) {
        // Update title and legend alignment
        if (window.innerWidth < 768) {
          chartInstance.current.options.plugins.title.align = "start";
        } else {
          chartInstance.current.options.plugins.title.align = "center";
        }
        chartInstance.current.update();
      }
    };

    window.addEventListener("resize", handleResize);

    // Process data based on selected timeframe
    const range = timeRanges[timeframe].getRange();
    const isHourly = range.hourly;

    let filteredVisitors = visitors || [];

    console.log(`Timeline - ${timeframe} mode:`, {
      visitorsCount: visitors?.length || 0,
      linksCount: links?.length || 0,
      isAllTime: range.allTime,
      isHourly: isHourly,
    });

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

    console.log("Timeline - Click events extracted:", {
      extractedClickCount: allClickEvents.length,
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
    } else {
      // For allTime, use all visitors without filtering
      filteredVisitors = [...visitors];

      // If we have links with clickCounts but no clickHistory,
      // ensure we include those dates too for better visualization
      links.forEach((link) => {
        if (
          link.createdAt &&
          !allClickEvents.some(
            (e) => e.date.getTime() === new Date(link.createdAt).getTime()
          )
        ) {
          allClickEvents.push({ date: new Date(link.createdAt) });
        }
      });
    }

    console.log("Timeline - After filtering:", {
      filteredVisitorsCount: filteredVisitors.length,
      allClickEventsCount: allClickEvents.length,
    });

    // For empty filtered results, show an empty chart
    if (filteredVisitors.length === 0 && allClickEvents.length === 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Check if chartRef.current exists before trying to get its context
      if (chartRef.current) {
        const ctx = chartRef.current.getContext("2d");
        chartInstance.current = createChart(
          ctx,
          ["No data"],
          [0],
          [0],
          t("noActivityData")
        );
      }
      return;
    }

    // Handle hourly view for Today or Yesterday
    if (isHourly) {
      // Create 24 hour periods - all hours will be included
      for (let hour = 0; hour < 24; hour++) {
        const date = new Date(range.start);
        date.setHours(hour, 0, 0, 0);
        periods.push(date);
      }

      // Use appropriate hour format based on user's locale
      periodFormat = { hour: "numeric", hour12: uses12HourFormat };
      groupingFn = (date) => {
        const visitDate = new Date(date);
        visitDate.setMinutes(0, 0, 0, 0);
        return visitDate.getTime();
      };
    }
    // Handle different date-based ranges
    else if (timeframe === "last7Days") {
      // Last 7 days - ensure ALL consecutive days are created
      // Create all 7 days in sequence without skipping
      const end = new Date();
      end.setHours(0, 0, 0, 0);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);

      // Clear periods array and rebuild with consecutive days
      periods = [];
      let currentDate = new Date(start);

      while (currentDate <= end) {
        periods.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      periodFormat = { month: "short", day: "numeric" };
      groupingFn = (date) => {
        const visitDate = new Date(date);
        visitDate.setHours(0, 0, 0, 0);
        return visitDate.getTime();
      };
    } else if (timeframe === "last30Days") {
      // Last 30 days - ensure ALL consecutive days are created
      // Create all 30 days in sequence without skipping
      const end = new Date();
      end.setHours(0, 0, 0, 0);
      const start = new Date(end);
      start.setDate(start.getDate() - 29);

      // Clear periods array and rebuild with consecutive days
      periods = [];
      let currentDate = new Date(start);

      while (currentDate <= end) {
        periods.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      periodFormat = { month: "short", day: "numeric" };
      groupingFn = (date) => {
        const visitDate = new Date(date);
        visitDate.setHours(0, 0, 0, 0);
        return visitDate.getTime();
      };
    } else if (timeframe === "currentMonth" || timeframe === "lastMonth") {
      // Current or last month - ensure ALL consecutive days are created
      const startDate = new Date(range.start);
      const endDate = range.end || new Date();

      // Clear the periods array and rebuild with all consecutive days
      periods = [];

      // Create a new date object to iterate through all days
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        // Add a copy of the current date to the periods array
        periods.push(new Date(currentDate));

        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log(`Timeline - ${timeframe} periods:`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        periodsCreated: periods.length,
        firstDay: periods[0]?.getDate(),
        lastDay: periods[periods.length - 1]?.getDate(),
      });

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
      console.log("Timeline - Setting up allTime view", {
        filteredVisitorsLength: filteredVisitors.length,
        allClickEventsLength: allClickEvents.length,
      });

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
        if (allClickEvents.length > 0) {
          allClickEvents.forEach((clickEvent) => {
            const clickDate = clickEvent.date;
            if (clickDate < earliestDate) earliestDate = clickDate;
            if (clickDate > latestDate) latestDate = clickDate;
          });
        }

        console.log("Timeline - AllTime date range:", {
          earliestDate,
          latestDate,
          rangeInMonths:
            (latestDate.getTime() - earliestDate.getTime()) /
            (1000 * 60 * 60 * 24 * 30),
        });

        // Create periods by month between earliest and latest
        let currentDate = new Date(earliestDate);
        currentDate.setDate(1); // Start at first day of month

        while (currentDate <= latestDate) {
          periods.push(new Date(currentDate));
          currentDate.setMonth(currentDate.getMonth() + 1);
        }

        // Add one more period after the latest date to ensure we capture everything
        if (periods.length > 0) {
          const lastPeriod = new Date(periods[periods.length - 1]);
          lastPeriod.setMonth(lastPeriod.getMonth() + 1);
          periods.push(new Date(lastPeriod));
        }

        console.log("Timeline - AllTime periods created:", {
          periodsCount: periods.length,
        });

        periodFormat = { year: "numeric", month: "short" };
        groupingFn = (date) => {
          const visitDate = new Date(date);
          visitDate.setDate(1);
          visitDate.setHours(0, 0, 0, 0);
          return visitDate.getTime();
        };
      } else {
        // If no data, create at least a 6-month period to show in the chart
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        console.log("Timeline - Creating default 6-month period:", {
          sixMonthsAgo,
          now,
        });

        // Create 6 monthly periods
        let currentDate = new Date(sixMonthsAgo);
        while (currentDate <= now) {
          periods.push(new Date(currentDate));
          currentDate.setMonth(currentDate.getMonth() + 1);
        }

        console.log("Timeline - Default periods created:", {
          periodsCount: periods.length,
        });

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

      // For allTime view, we need to make sure we count the visit even if the
      // exact period doesn't match (this could happen due to timezone differences)
      if (timeframe === "allTime") {
        // Find the closest period (month) for this visit
        let closestPeriodKey = null;
        let minDiff = Infinity;

        // Iterate through periods to find the closest match
        for (const period of periods) {
          const periodTime = period.getTime();
          const diff = Math.abs(periodTime - periodKey);
          if (diff < minDiff) {
            minDiff = diff;
            closestPeriodKey = periodTime;
          }
        }

        if (closestPeriodKey && visitPeriodMap.has(closestPeriodKey)) {
          visitPeriodMap.set(
            closestPeriodKey,
            visitPeriodMap.get(closestPeriodKey) + 1
          );
        } else if (visitPeriodMap.has(periodKey)) {
          // Fallback if no closest period found
          visitPeriodMap.set(periodKey, visitPeriodMap.get(periodKey) + 1);
        }
      } else if (visitPeriodMap.has(periodKey)) {
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

      console.log("Timeline - Processing click events:", {
        totalClickEvents: allClickEvents.length,
        filteredClickEvents: filteredClickEvents.length,
      });

      // Count clicks by period
      filteredClickEvents.forEach((clickEvent) => {
        const periodKey = groupingFn(clickEvent.date);

        // For allTime view, we need to make sure we count the click even if the
        // exact period doesn't match (this could happen due to timezone differences)
        if (timeframe === "allTime") {
          // Find the closest period (month) for this click
          let closestPeriodKey = null;
          let minDiff = Infinity;

          // Iterate through periods to find the closest match
          for (const period of periods) {
            const periodTime = period.getTime();
            const diff = Math.abs(periodTime - periodKey);
            if (diff < minDiff) {
              minDiff = diff;
              closestPeriodKey = periodTime;
            }
          }

          if (closestPeriodKey && clickPeriodMap.has(closestPeriodKey)) {
            clickPeriodMap.set(
              closestPeriodKey,
              clickPeriodMap.get(closestPeriodKey) + 1
            );
          } else if (clickPeriodMap.has(periodKey)) {
            // Fallback if no closest period found
            clickPeriodMap.set(periodKey, clickPeriodMap.get(periodKey) + 1);
          }
        } else if (clickPeriodMap.has(periodKey)) {
          clickPeriodMap.set(periodKey, clickPeriodMap.get(periodKey) + 1);
        }
      });
    }

    // Convert to arrays for Chart.js
    periods.forEach((period) => {
      visitCounts.push(visitPeriodMap.get(period.getTime()));
      clickCounts.push(clickPeriodMap.get(period.getTime()));
    });

    // Format periods for the x-axis using the user's locale instead of hardcoded "en-US"
    let labels = [];

    // Customize labels based on timeframe to ensure proper consecutive display
    if (isHourly && uses12HourFormat) {
      // For 12-hour format, ensure 12 AM, 1 AM, 2 AM... sequence
      labels = periods.map((date) => {
        let hour = date.getHours();
        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12;
        hour = hour ? hour : 12; // Convert 0 to 12 for 12 AM
        return `${hour} ${ampm}`;
      });

      // Log each hour's timestamp to ensure proper sequence
      console.log(
        "Timeline - 12-hour format hours:",
        periods.map(
          (d) =>
            `${d.toLocaleTimeString()} → ${d.getHours() % 12 || 12} ${
              d.getHours() >= 12 ? "PM" : "AM"
            }`
        )
      );
    } else if (isHourly && !uses12HourFormat) {
      // For 24-hour format, ensure 00, 01, 02... sequence with leading zeros for consistency
      labels = periods.map((date) => {
        const hour = date.getHours();
        return `${hour.toString().padStart(2, "0")}:00`;
      });

      // Log each hour's timestamp to ensure proper sequence
      console.log(
        "Timeline - 24-hour format hours:",
        periods.map(
          (d) =>
            `${d.toLocaleTimeString()} → ${d
              .getHours()
              .toString()
              .padStart(2, "0")}:00`
        )
      );
    } else if (
      timeframe === "last7Days" ||
      timeframe === "last30Days" ||
      timeframe === "currentMonth" ||
      timeframe === "lastMonth"
    ) {
      // For consecutive days, use a format that will clearly show all days
      labels = periods.map((date) => {
        // Format: "Apr 6", "Apr 7", etc.
        return date.toLocaleString(userLocale, {
          month: "short",
          day: "numeric",
        });
      });

      // Log detailed information about created labels
      console.log(`Timeline - ${timeframe} formatted labels:`, {
        labelsCount: labels.length,
        labelsCreated: labels,
      });
    } else {
      // Default formatting for other timeframes
      labels = periods.map((date) =>
        date.toLocaleString(userLocale, periodFormat)
      );
    }

    // Log the labels to help diagnose issues
    console.log("Timeline - Formatted labels:", labels);

    console.log("Timeline - Final chart data:", {
      timeframe,
      periods: periods.length,
      userLocale,
      uses12HourFormat,
      visitCounts: visitCounts.reduce((a, b) => a + b, 0),
      clickCounts: clickCounts.reduce((a, b) => a + b, 0),
      hasZeroValues:
        visitCounts.every((count) => count === 0) &&
        clickCounts.every((count) => count === 0),
      labels, // Log the final formatted labels
    });

    // Additional debug information for "allTime" view
    if (timeframe === "allTime") {
      console.log("Timeline - 'allTime' view details:", {
        totalVisitors: filteredVisitors.length,
        totalClickEvents: allClickEvents.length,
        periodsCreated: periods.length,
        firstPeriod: periods.length > 0 ? periods[0].toISOString() : "none",
        lastPeriod:
          periods.length > 0
            ? periods[periods.length - 1].toISOString()
            : "none",
        formattedLabels: labels,
        visitCountsArray: visitCounts,
        clickCountsArray: clickCounts,
      });
    }

    // For hourly view, ensure all hours show and labels are properly aligned
    if (isHourly) {
      // Special handling for hourly charts
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Check if chartRef.current exists before trying to get its context
      if (chartRef.current) {
        const chartCtx = chartRef.current.getContext("2d");
        chartInstance.current = createChart(
          chartCtx,
          labels,
          visitCounts,
          clickCounts,
          timeRanges[timeframe].label
        );

        // Force all 24 hours to be shown
        if (chartInstance.current) {
          chartInstance.current.options.scales.x.ticks.autoSkip = false;
          // Slightly increase rotation to prevent overlapping for hourly labels
          chartInstance.current.options.scales.x.ticks.maxRotation = 45;
          chartInstance.current.update();
        }
      }
    }
    // Special handling for month views to ensure all dates show
    else if (timeframe === "lastMonth" || timeframe === "currentMonth") {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Check if chartRef.current exists before trying to get its context
      if (chartRef.current) {
        const chartCtx = chartRef.current.getContext("2d");
        chartInstance.current = createChart(
          chartCtx,
          labels,
          visitCounts,
          clickCounts,
          timeRanges[timeframe].label
        );

        // Force all days to be shown for month view
        if (chartInstance.current) {
          chartInstance.current.options.scales.x.ticks.autoSkip = false;
          chartInstance.current.options.scales.x.ticks.maxRotation = 65; // Higher rotation to fit all days
          chartInstance.current.update();
        }
      }
    }
    // If we have too many labels and they're getting crowded, consider adjusting display
    else if (!isHourly && labels.length > 15) {
      // For the chart options to prevent overlapping labels
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Check if chartRef.current exists before trying to get its context
      if (chartRef.current) {
        // Create a new chart
        const chartCtx = chartRef.current.getContext("2d");
        chartInstance.current = createChart(
          chartCtx,
          labels,
          visitCounts,
          clickCounts,
          timeRanges[timeframe].label
        );

        // For last7Days or last30Days, set better options for readability while showing all data
        if (
          timeframe === "last7Days" ||
          timeframe === "last30Days" ||
          timeframe === "currentMonth" ||
          timeframe === "lastMonth"
        ) {
          if (chartInstance.current) {
            // For these specific views, we want to ensure all dates are shown
            // but adjust the rotation to prevent overlap
            chartInstance.current.options.scales.x.ticks.maxRotation = 65;
            chartInstance.current.options.scales.x.ticks.autoSkip = false;
            chartInstance.current.update();
          }
        } else {
          // For other views with many labels, use auto-skip but with a reasonable limit
          if (chartInstance.current) {
            chartInstance.current.options.scales.x.ticks.autoSkip = true;
            // For other views, show a reasonable number
            chartInstance.current.options.scales.x.ticks.maxTicksLimit =
              Math.min(labels.length, 15);
            chartInstance.current.update();
          }
        }
      }
    } else {
      // Create a new chart with our improved function that includes both datasets
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Check if chartRef.current exists before trying to get its context
      if (chartRef.current) {
        const ctx = chartRef.current.getContext("2d");
        chartInstance.current = createChart(
          ctx,
          labels,
          visitCounts,
          clickCounts,
          timeRanges[timeframe].label
        );
      }
    }

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [visitors, links, timeframe, isLoading, currentLang, uses12HourFormat]);

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

  // Safety check for server-side rendering
  const isClient = typeof window !== "undefined";

  return (
    <div
      suppressHydrationWarning
      className={`bg-background rounded-lg border border-border shadow-md transition-all duration-300 hover:shadow-lg`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
        <h2
          className={`p15 text-xl font-semibold text-foreground flex items-center mb-4 md:mb-0`}
        >
          <TrendingUp size={20} className="mr-2 text-primary" />
          {t("activityTimeline")}
        </h2>

        <div className="p15 relative" ref={dropdownRef}>
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

      {/* Custom legend section with interactive functionality */}
      <div className="px-4 pb-12 pt-2 flex flex-wrap items-center gap-2 justify-start md:justify-center">
        <div
          className={`flex items-center mr-2 mb-2 cursor-pointer px-3 py-1.5 rounded-md transition-all duration-200 ${
            !visitsVisible ? "opacity-60 bg-background/50" : "hover:bg-muted/40"
          }`}
          onClick={() => toggleDataset(0)}
          role="button"
          aria-label={`Toggle ${t("visits")} visibility`}
        >
          <div className="w-5 h-5 flex items-center justify-center mr-1.5">
            {visitsVisible ? (
              <Check size={14} className="text-primary" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-sm border border-muted-foreground"></span>
            )}
          </div>
          <span className="inline-block w-3 h-3 rounded-full bg-[#FB75CC] mr-2"></span>
          <span className="text-sm font-medium">{t("visits")}</span>
        </div>
        {!hideClicks && (
          <div
            className={`flex items-center mb-2 cursor-pointer px-3 py-1.5 rounded-md transition-all duration-200 ${
              !clicksVisible
                ? "opacity-60 bg-background/50"
                : "hover:bg-muted/40"
            }`}
            onClick={() => toggleDataset(1)}
            role="button"
            aria-label={`Toggle ${t("clicks")} visibility`}
          >
            <div className="w-5 h-5 flex items-center justify-center mr-1.5">
              {clicksVisible ? (
                <Check size={14} className="text-primary" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-sm border border-muted-foreground"></span>
              )}
            </div>
            <span className="inline-block w-3 h-3 rounded-full bg-[#8b5cf6] mr-2"></span>
            <span className="text-sm font-medium">{t("clicks")}</span>
          </div>
        )}
      </div>

      {/* Scrollable chart container with increased spacing */}
      <div className={`overflow-x-auto scrollbar-hide pb-2`}>
        <div className={`h-80 mt-2 min-w-[600px]`}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
}
