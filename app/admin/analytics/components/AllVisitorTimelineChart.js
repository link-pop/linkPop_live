"use client";

import { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import { Calendar, ChevronDown, TrendingUp } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

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
  foreground: "hsl(var(--foreground))", // Theme foreground color
  legendText: "rgba(156, 163, 175, 0.9)", // Legend text color
};
// ? code end chart theme colors

// ! code start VisitorTimelineChart
export default function VisitorTimelineChart({
  visitors,
  items,
  visitorsByItem,
  title,
  itemLabel,
  hideClicks,
}) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [timeframe, setTimeframe] = useState("last30Days"); // Default to last 30 days
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { t, currentLang } = useTranslation();

  // Use the current language for date formatting
  const userLocale = currentLang || "en";

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
  const createChart = (ctx, labels, datasets, chartTitle) => {
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

    // Find the maximum value across all datasets for scaling
    const maxValue = Math.max(
      ...datasets.map((dataset) =>
        Math.max(...dataset.data.filter((val) => val !== null))
      )
    );

    const stepSize = maxValue <= 10 ? 1 : Math.ceil(maxValue / 10);

    return new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          // Disable animation completely for very large datasets
          duration:
            datasets.length > 200
              ? 0
              : datasets.length > 100
              ? 300
              : datasets.length > 50
              ? 750
              : 1500,
          easing: "easeOutQuint",
        },
        // Optimize performance for large datasets
        devicePixelRatio: datasets.length > 200 ? 1 : undefined, // Lower resolution for large datasets
        // Disable animation on dataset change for large datasets
        transitions: {
          active: {
            animation: {
              duration: datasets.length > 100 ? 0 : 300,
            },
          },
        },
        layout: {
          padding: {
            top: 25,
            right: 25,
            bottom: 15,
            left: 15,
          },
        },
        // Performance optimizations for large datasets
        elements: {
          line: {
            // Disable bezier curve for large datasets to improve performance
            tension:
              datasets.length > 100 ? 0 : datasets.length > 50 ? 0.1 : 0.4,
            // For extremely large datasets, reduce line width
            borderWidth: datasets.length > 200 ? 1 : 2,
          },
          point: {
            // Reduce or disable points for large datasets
            radius:
              datasets.length > 200
                ? 0 // Hide points for extremely large datasets
                : datasets.length > 100
                ? 1 // Tiny points for large datasets
                : datasets.length > 50
                ? 2 // Small points for medium datasets
                : datasets.length > 20
                ? 3
                : 4, // Normal points for small datasets
            hitRadius: datasets.length > 200 ? 3 : 8, // Keep hit radius reasonable for interaction
            hoverRadius:
              datasets.length > 200
                ? 2
                : datasets.length > 100
                ? 3
                : datasets.length > 50
                ? 4
                : datasets.length > 20
                ? 6
                : 8,
            // Disable hover animation for very large datasets to improve performance
            hoverBorderWidth: datasets.length > 200 ? 0 : 2,
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
                size: datasets.length > 200 ? 10 : 12,
                weight: "500",
              },
              maxRotation: 45,
              minRotation: 0,
              padding: 10,
              autoSkip: datasets.length > 100, // Skip some ticks for large datasets
              maxTicksLimit:
                datasets.length > 200 ? 20 : datasets.length > 100 ? 30 : 1000, // Limit ticks for better performance
              callback: function (value, index, values) {
                // For large datasets, show fewer labels but ensure first and last are visible
                const totalLabels = values.length;
                if (datasets.length > 100) {
                  if (
                    index === 0 ||
                    index === totalLabels - 1 ||
                    index % Math.ceil(totalLabels / 20) === 0
                  ) {
                    return labels[index]; // Return directly from our labels array
                  }
                  return "";
                }
                return labels[index]; // Always return from our labels array rather than the value parameter
              },
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
            align: "start",
            // Optimize legend for large datasets
            labels: {
              usePointStyle: true,
              padding: datasets.length > 100 ? 8 : 16,
              font: {
                size: datasets.length > 200 ? 10 : 12,
                weight: "500",
              },
              color: chartColors.legendText, // Fix legend item color
              boxWidth: datasets.length > 200 ? 6 : 8,
              boxHeight: datasets.length > 200 ? 6 : 8,
              // Allow more legend items to be displayed
              generateLabels: function (chart) {
                const datasets = chart.data.datasets;
                // For very large datasets, only show the first dataset (All) and the top most active ones
                const maxVisibleItems = 100; // Maximum number of items to show in legend

                let datasetsToShow = datasets;
                if (datasets.length > maxVisibleItems) {
                  // Keep "All" dataset plus the top active ones
                  const firstDataset = datasets.slice(0, 1);
                  const otherDatasets = datasets
                    .slice(1)
                    .map((dataset, index) => ({ dataset, index: index + 1 }))
                    .sort((a, b) => {
                      // Sort by activity level (sum of data points)
                      const sumA = a.dataset.data.reduce(
                        (sum, val) => sum + (val || 0),
                        0
                      );
                      const sumB = b.dataset.data.reduce(
                        (sum, val) => sum + (val || 0),
                        0
                      );
                      return sumB - sumA;
                    })
                    .slice(0, maxVisibleItems - 1)
                    .sort((a, b) => a.index - b.index) // Restore original order
                    .map((item) => item.dataset);

                  datasetsToShow = [...firstDataset, ...otherDatasets];

                  // Add indication that not all items are shown in legend
                  if (datasets.length > maxVisibleItems) {
                    console.log(
                      `Showing ${maxVisibleItems} out of ${datasets.length} datasets in legend`
                    );
                  }
                }

                return datasetsToShow.map((dataset, i) => {
                  return {
                    text: dataset.label,
                    fillStyle: dataset.backgroundColor || dataset.borderColor,
                    strokeStyle: dataset.borderColor,
                    lineWidth: dataset.borderWidth,
                    hidden: !chart.isDatasetVisible(i),
                    index: i,
                    datasetIndex: i,
                    // Force the legend text color
                    fontColor: chartColors.legendText,
                  };
                });
              },
              // Do not automatically filter out any items
              filter: function () {
                return true;
              },
            },
            // Allow scrolling in legend if there are too many items
            maxHeight: 200,
            maxWidth: "100%",
            fullSize: true,
            onClick: function (e, legendItem, legend) {
              const index = legendItem.datasetIndex;
              const chart = legend.chart;
              const meta = chart.getDatasetMeta(index);

              meta.hidden =
                meta.hidden === null
                  ? !chart.data.datasets[index].hidden
                  : null;

              if (
                chart.data.datasets.length > 20 &&
                index > 0 &&
                !meta.hidden
              ) {
                chart.data.datasets.forEach((dataset, idx) => {
                  if (idx !== 0 && idx !== index) {
                    const otherMeta = chart.getDatasetMeta(idx);
                    otherMeta.hidden = true;
                  }
                });
              }

              if (index === 0) {
                const allVisible = !meta.hidden;
                chart.data.datasets.forEach((dataset, idx) => {
                  if (idx !== 0) {
                    const otherMeta = chart.getDatasetMeta(idx);
                    otherMeta.hidden = !allVisible;
                  }
                });
              }

              chart.update();
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
                  value !== 1 ? t("visitors") : t("visitor")
                }`;
              },
            },
          },
          title: {
            display: true,
            text: chartTitle,
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
    // Don't proceed if we don't have visitors or items
    if (!visitors || visitors.length === 0 || !items || items.length === 0)
      return;

    console.log("Total items in chart:", items.length);

    // For direct links, we don't show clicks data
    if (hideClicks) {
      console.log("Hiding clicks data for direct links");
    }

    // Process data based on selected timeframe
    const range = timeRanges[timeframe].getRange();
    const isHourly = range.hourly;

    // Filter visitors based on selected time range
    let filteredVisitors = visitors;
    if (!range.allTime) {
      const endDate = range.end || new Date();
      filteredVisitors = visitors.filter((visitor) => {
        const visitDate = new Date(visitor.createdAt);
        return visitDate >= range.start && visitDate <= endDate;
      });
    }

    let periods = [];
    let periodFormat = {};
    let groupingFn;

    // Handle hourly view for Today or Yesterday
    if (isHourly) {
      // Create 24 hour periods
      for (let hour = 0; hour < 24; hour++) {
        const date = new Date(range.start);
        date.setHours(hour, 0, 0, 0);
        periods.push(date);
      }

      periodFormat = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: uses12HourFormat,
      };
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
      // Fix: Explicitly set the weekday format to ensure it shows as Mon, Tue, Wed, etc.
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

      periodFormat = { month: "short", day: "numeric" };
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
      console.log("Timeline - Setting up allTime view", {
        filteredVisitorsLength: filteredVisitors.length,
      });

      if (filteredVisitors.length > 0) {
        // Find the earliest and latest dates
        let earliestDate = new Date();
        let latestDate = new Date(0); // January 1, 1970

        filteredVisitors.forEach((visitor) => {
          const visitDate = new Date(visitor.createdAt);
          if (visitDate < earliestDate) earliestDate = visitDate;
          if (visitDate > latestDate) latestDate = visitDate;
        });

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

    // Format periods for the x-axis
    const labels = periods.map((date) => {
      // When using last7Days, ensure we're getting weekday names
      if (timeframe === "last7Days") {
        // Use Intl.DateTimeFormat for more consistent cross-browser formatting
        const formatter = new Intl.DateTimeFormat(userLocale, {
          weekday: "short",
        });
        const weekdayLabel = formatter.format(date);

        // Debug logging
        if (periods.indexOf(date) === 0) {
          console.log("Last7Days format example:", {
            date: date.toISOString(),
            weekdayLabel,
            userLocale,
            dayOfWeek: date.getDay(), // 0 = Sunday, 1 = Monday, etc.
          });
        }
        return weekdayLabel;
      }
      return date.toLocaleString(userLocale, periodFormat);
    });

    // Additional logging for last7Days
    if (timeframe === "last7Days") {
      console.log("Last7Days - all formatted labels:", labels);
    }

    // Create a dataset for each item - show all items, not just top 5
    const itemVisitorCounts = Object.keys(visitorsByItem)
      .map((itemId) => {
        return {
          itemId,
          count: visitorsByItem[itemId].length,
        };
      })
      .sort((a, b) => b.count - a.count);

    console.log(
      `Total landing pages with visitors: ${itemVisitorCounts.length}`
    );
    console.log(`Total landing pages in database: ${items.length}`);

    // Make sure all items are represented, even if they have no visitors
    items.forEach((item) => {
      const itemId = item._id.toString();
      if (!visitorsByItem[itemId]) {
        // Add entry for items with no visitors
        console.log(`Adding item with no visitors: ${item.name}`);
        itemVisitorCounts.push({
          itemId,
          count: 0,
        });
      }
    });

    console.log(
      `Total items after adding those with no visitors: ${itemVisitorCounts.length}`
    );

    // Create datasets for chart
    const datasets = [];

    // Create dataset for all items (total)
    const allItemsCounts = [];
    periods.forEach((period) => {
      const periodKey = period.getTime();
      let count = 0;

      if (timeframe === "allTime") {
        // For allTime view, find closest period match
        filteredVisitors.forEach((visitor) => {
          const visitDate = new Date(visitor.createdAt);
          const visitorPeriodKey = groupingFn(visitDate);

          // Calculate time difference between this period and visitor's period
          const timeDiff = Math.abs(periodKey - visitorPeriodKey);
          // Consider it a match if it's the closest period or within one month
          if (timeDiff <= 30 * 24 * 60 * 60 * 1000) {
            count++;
          }
        });
      } else {
        // Standard period matching for other timeframes
        count = filteredVisitors.filter((visitor) => {
          const visitDate = new Date(visitor.createdAt);
          const visitorPeriodKey = groupingFn(visitDate);
          return visitorPeriodKey === periodKey;
        }).length;
      }

      allItemsCounts.push(count);
    });

    // Create visitor gradient for the chart background
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");

      // Create gradient for chart background
      const totalGradientFill = ctx.createLinearGradient(0, 0, 0, 350);
      totalGradientFill.addColorStop(0, chartColors.primaryGradientStart);
      totalGradientFill.addColorStop(1, chartColors.primaryGradientEnd);

      // Add dataset for all items
      datasets.push({
        label: `All ${title}`,
        data: allItemsCounts,
        borderWidth: 3,
        borderColor: chartColors.primary,
        backgroundColor: totalGradientFill,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: chartColors.secondary,
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 3,
        cubicInterpolationMode: "monotone",
      });

      // Define a large color palette for many items
      // Base colors that will be used with different opacities and variations
      const baseColors = [
        "#FB75CC", // Pink (primary)
        "#8b5cf6", // Purple (secondary)
        "#0ea5e9", // Sky blue (accent)
        "#10b981", // Green
        "#f59e0b", // Amber
        "#ef4444", // Red
        "#06b6d4", // Cyan
        "#8b5cf6", // Violet
        "#ec4899", // Pink
        "#f43f5e", // Rose
        "#14b8a6", // Teal
        "#a3e635", // Lime
        // Add more base colors to support more unique colors
        "#6366f1", // Indigo
        "#d946ef", // Fuchsia
        "#0284c7", // Light Blue
        "#84cc16", // Light Green
        "#ca8a04", // Yellow
        "#7c3aed", // Violet
        "#db2777", // Pink
        "#dc2626", // Red
        "#0d9488", // Teal
        "#65a30d", // Lime
        "#9333ea", // Purple
        "#4f46e5", // Indigo
      ];

      // Generate more colors by varying the base colors
      const generateColors = (count) => {
        // For very large numbers of items, use a more efficient approach
        if (count > 500) {
          console.log("Optimizing color generation for 500+ items");

          // For extremely large sets, use HSL directly
          const colors = [];
          // Use golden ratio to get good distribution of colors
          const goldenRatioConjugate = 0.618033988749895;
          let h = Math.random(); // Random starting hue

          // Generate first colors using base colors to maintain brand consistency
          for (let i = 0; i < Math.min(baseColors.length, count); i++) {
            colors.push(baseColors[i]);
          }

          // Generate the rest using HSL directly
          for (let i = baseColors.length; i < count; i++) {
            h += goldenRatioConjugate;
            h %= 1; // Wrap around to stay in [0,1]

            // Convert to HSL string with good saturation and lightness
            const s = 0.5 + (0.25 * ((i * 41) % 10)) / 10; // Vary saturation between 0.5-0.75
            const l = 0.4 + (0.2 * ((i * 17) % 10)) / 10; // Vary lightness between 0.4-0.6

            // Convert HSL to hex color
            const [r, g, b] = hslToRgb(h * 360, s * 100, l * 100);
            const hexColor = `#${r.toString(16).padStart(2, "0")}${g
              .toString(16)
              .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
            colors.push(hexColor);
          }

          return colors;
        }

        // For smaller sets, use the original approach with more variations
        const colors = [];
        for (let i = 0; i < count; i++) {
          // Use the base color with a little variation
          const baseColorIndex = i % baseColors.length;
          const baseColor = baseColors[baseColorIndex];

          // For repeated colors, adjust brightness and saturation
          if (i >= baseColors.length) {
            const cycle = Math.floor(i / baseColors.length);
            const variation = cycle * 10 - 20;
            const saturationAdjust =
              cycle % 3 === 0 ? 20 : cycle % 3 === 1 ? -20 : 0;

            // Convert hex to RGB
            const r = parseInt(baseColor.slice(1, 3), 16);
            const g = parseInt(baseColor.slice(3, 5), 16);
            const b = parseInt(baseColor.slice(5, 7), 16);

            // Convert RGB to HSL for better color manipulation
            const [h, s, l] = rgbToHsl(r, g, b);

            // Adjust lightness and saturation
            const newL = Math.max(0, Math.min(100, l + variation));
            const newS = Math.max(0, Math.min(100, s + saturationAdjust));

            // Convert back to RGB
            const [newR, newG, newB] = hslToRgb(h, newS, newL);

            // Convert to hex
            const newColor = `#${newR.toString(16).padStart(2, "0")}${newG
              .toString(16)
              .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
            colors.push(newColor);
          } else {
            colors.push(baseColor);
          }
        }
        return colors;
      };

      // Helper function to convert RGB to HSL
      const rgbToHsl = (r, g, b) => {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h,
          s,
          l = (max + min) / 2;

        if (max === min) {
          h = s = 0; // achromatic
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;
            case g:
              h = (b - r) / d + 2;
              break;
            case b:
              h = (r - g) / d + 4;
              break;
          }

          h /= 6;
        }

        return [h * 360, s * 100, l * 100];
      };

      // Helper function to convert HSL to RGB
      const hslToRgb = (h, s, l) => {
        h /= 360;
        s /= 100;
        l /= 100;

        let r, g, b;

        if (s === 0) {
          r = g = b = l; // achromatic
        } else {
          const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
          };

          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;

          r = hue2rgb(p, q, h + 1 / 3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1 / 3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
      };

      // Generate enough colors for all items
      const colors = generateColors(itemVisitorCounts.length);

      // Process all items for datasets - ensure we can handle 1000+ items
      console.log(
        `Processing ${itemVisitorCounts.length} items for chart datasets`
      );

      // For extremely large datasets, limit visible items and sample the data
      const maxVisibleItems = 500; // Maximum number of individual datasets to render
      let itemsToProcess = itemVisitorCounts;

      if (itemVisitorCounts.length > maxVisibleItems) {
        console.log(
          `Limiting visible datasets to ${maxVisibleItems} out of ${itemVisitorCounts.length} total items`
        );

        // Keep most active items (most visitors)
        itemsToProcess = itemVisitorCounts
          .sort((a, b) => b.count - a.count) // Sort by visit count
          .slice(0, maxVisibleItems);
      }

      // Create a threshold for very large datasets to improve performance
      const useSimplifiedRendering = itemVisitorCounts.length > 200;

      // Process datasets - for large datasets, process in batches to avoid UI freeze
      const batchSize = 100;
      for (let i = 0; i < itemsToProcess.length; i++) {
        // Log progress for large datasets
        if (i % batchSize === 0 && itemsToProcess.length > 100) {
          console.log(
            `Processing items batch ${
              Math.floor(i / batchSize) + 1
            }/${Math.ceil(itemsToProcess.length / batchSize)}`
          );
        }

        const item = itemsToProcess[i];
        const itemId = item.itemId;
        const dataItem = items.find((d) => d._id.toString() === itemId);

        if (!dataItem) continue;

        const itemName = dataItem.name;
        if (i < 10 || i % 50 === 0) {
          console.log(
            `Processing dataset for item: ${itemName} (${i + 1}/${
              itemsToProcess.length
            })`
          );
        }

        const color = colors[i % colors.length];

        // Create counts array for this item
        const itemCounts = [];
        periods.forEach((period) => {
          const periodKey = period.getTime();
          const itemVisitors = visitorsByItem[itemId] || [];

          let count = 0;

          if (timeframe === "allTime") {
            // For allTime view, find closest period match
            itemVisitors.forEach((visitor) => {
              const visitDate = new Date(visitor.createdAt);
              const visitorPeriodKey = groupingFn(visitDate);

              // Calculate time difference between this period and visitor's period
              const timeDiff = Math.abs(periodKey - visitorPeriodKey);
              // Consider it a match if it's within one month (approximate match)
              if (timeDiff <= 30 * 24 * 60 * 60 * 1000) {
                count++;
              }
            });
          } else {
            // Standard period matching for other timeframes
            count = itemVisitors.filter((visitor) => {
              const visitDate = new Date(visitor.createdAt);
              const visitorPeriodKey = groupingFn(visitDate);
              return visitorPeriodKey === periodKey;
            }).length;
          }

          itemCounts.push(count);
        });

        // For performance with large datasets, use smaller point size
        const pointRadius =
          itemVisitorCounts.length > 200
            ? 0 // Hide points for extremely large datasets
            : itemVisitorCounts.length > 100
            ? 1 // Tiny points for large datasets
            : itemVisitorCounts.length > 50
            ? 2 // Small points for medium datasets
            : itemVisitorCounts.length > 20
            ? 3
            : 4; // Normal points for small datasets

        const pointHoverRadius =
          itemVisitorCounts.length > 200
            ? 2
            : itemVisitorCounts.length > 100
            ? 3
            : itemVisitorCounts.length > 50
            ? 4
            : itemVisitorCounts.length > 20
            ? 5
            : 6;

        // Simplified dataset configuration for better performance with large datasets
        const datasetConfig = useSimplifiedRendering
          ? {
              label: `@${itemName}`,
              data: itemCounts,
              borderWidth: 1,
              borderColor: color,
              backgroundColor: "transparent",
              tension: 0,
              fill: false,
              pointRadius: 0,
              hitRadius: 3,
              hoverRadius: 2,
              pointBackgroundColor: color,
              borderDash: i % 2 === 0 ? [5, 5] : undefined, // Alternate dash patterns for distinguishing lines
            }
          : {
              label: `@${itemName}`,
              data: itemCounts,
              borderWidth: itemVisitorCounts.length > 50 ? 1 : 2,
              borderColor: color,
              backgroundColor: "transparent",
              tension: 0.4,
              fill: false,
              pointBackgroundColor: color,
              pointBorderColor: "#fff",
              pointBorderWidth: itemVisitorCounts.length > 50 ? 1 : 2,
              pointRadius: pointRadius,
              pointHoverRadius: pointHoverRadius,
              pointHoverBackgroundColor: color,
              pointHoverBorderColor: "#fff",
              pointHoverBorderWidth: 2,
              cubicInterpolationMode: "monotone",
            };

        datasets.push(datasetConfig);
      }
    }

    // If a chart already exists, destroy it
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create a new chart
    const ctx = chartRef.current.getContext("2d");
    console.log(
      `Creating chart with ${datasets.length} datasets, showing a total of ${items.length} items`
    );

    // Additional debug information for "allTime" view
    if (timeframe === "allTime") {
      console.log("Timeline - 'allTime' view details:", {
        totalVisitors: filteredVisitors.length,
        userLocale: userLocale,
        uses12HourFormat: uses12HourFormat,
        periodsCreated: periods.length,
        firstPeriod: periods.length > 0 ? periods[0].toISOString() : "none",
        lastPeriod:
          periods.length > 0
            ? periods[periods.length - 1].toISOString()
            : "none",
        formattedLabels: labels,
        allItemsCountsTotal: allItemsCounts.reduce((a, b) => a + b, 0),
        allItemsCountsArray: allItemsCounts,
      });
    }

    // Check if all items are processed
    if (datasets.length < items.length + 1) {
      // +1 for the "All" dataset
      console.warn(
        `Warning: Not all items are shown in the chart. Datasets: ${datasets.length}, Items: ${items.length}`
      );
    }

    chartInstance.current = createChart(
      ctx,
      labels,
      datasets,
      timeRanges[timeframe].label
    );

    // Clean up
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [visitors, items, timeframe, visitorsByItem, title, hideClicks]);

  if (!visitors || visitors.length === 0) {
    return (
      <div className="text-center p-4 md:p-6 bg-background rounded-lg border border-border shadow-sm">
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-foreground">
          {t("activityTimeline")}
        </h2>
        <div className="py-8 md:py-12 text-muted-foreground">
          {t("noActivityData")}
        </div>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="p-3 bg-background rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
    >
      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-foreground flex items-center">
          <TrendingUp size={18} className="mr-2 text-primary" />
          {t(title.toLowerCase().replace(" ", ""))} {t("visitorTimeline")}
        </h2>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center px-3 py-1.5 md:px-4 md:py-2 border rounded-md bg-background text-xs md:text-sm font-medium text-foreground hover:bg-muted transition-colors duration-200 shadow-sm"
          >
            <Calendar size={14} className="mr-1.5 text-primary" />
            {timeRanges[timeframe].label}
            <ChevronDown size={14} className="ml-1.5 text-muted-foreground" />
          </button>

          {showDropdown && (
            <div className="absolute top-full right-0 mt-1 w-44 md:w-56 rounded-md shadow-lg bg-popover ring-1 ring-border ring-opacity-5 z-10 divide-y divide-border overflow-hidden">
              <div className="py-1">
                <button
                  onClick={() => {
                    setTimeframe("today");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
                >
                  {t("today")}
                </button>
                <button
                  onClick={() => {
                    setTimeframe("yesterday");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
                >
                  {t("yesterday")}
                </button>
                <button
                  onClick={() => {
                    setTimeframe("last7Days");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
                >
                  {t("last7Days")}
                </button>
                <button
                  onClick={() => {
                    setTimeframe("last30Days");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
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
                  className="w-full text-left px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
                >
                  {t("currentMonth")}
                </button>
                <button
                  onClick={() => {
                    setTimeframe("lastMonth");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
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
                  className="w-full text-left px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
                >
                  {t("currentYear")}
                </button>
                <button
                  onClick={() => {
                    setTimeframe("lastYear");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
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
                  className="w-full text-left px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
                >
                  {t("allTime")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-60 md:h-80 mt-2">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
// ? code end VisitorTimelineChart
