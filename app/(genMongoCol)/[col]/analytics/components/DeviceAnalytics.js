"use client";

import { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function DeviceAnalytics({ visitors, isDemoMode = false }) {
  const [activeTab, setActiveTab] = useState("devices");
  const deviceChartRef = useRef(null);
  const browserChartRef = useRef(null);
  const deviceChartInstance = useRef(null);
  const browserChartInstance = useRef(null);
  const { t } = useTranslation();

  // ! code start demo data
  // Generate demo data for devices and browsers if in demo mode
  const getDemoData = () => {
    if (!isDemoMode) return null;

    // Create predefined realistic distribution for device types
    const deviceData = {
      Mobile: 46,
      Desktop: 38,
      Tablet: 14,
      Other: 2,
    };

    // Create predefined realistic distribution for browsers
    const browserData = {
      Chrome: 62,
      Safari: 18,
      Firefox: 9,
      Edge: 7,
      Opera: 2,
      Other: 2,
    };

    return { deviceData, browserData };
  };
  // ? code end demo data

  useEffect(() => {
    if ((!visitors || visitors.length === 0) && !isDemoMode) return;

    // Get demo data if in demo mode
    const demoData = getDemoData();

    // If we're in demo mode and have demo data, use that instead of processing visitors
    if (isDemoMode && demoData) {
      // Helper function to create chart
      function createChart(canvasRef, chartInstanceRef, data, title) {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        const ctx = canvasRef.current.getContext("2d");

        // Sort data by count descending
        const labels = Object.keys(data);
        const values = Object.values(data);
        const sortedIndices = values
          .map((_, i) => i)
          .sort((a, b) => values[b] - values[a]);

        const sortedLabels = sortedIndices.map((i) => labels[i]);
        const sortedValues = sortedIndices.map((i) => values[i]);

        // Use hardcoded colors
        const colors = [
          "rgba(251, 117, 204, 0.8)", // Brand color - #FB75CC
          "rgba(135, 206, 235, 0.8)", // SkyBlue #87CEEB
          "rgba(255, 99, 132, 0.8)", // Red
          "rgba(255, 206, 86, 0.8)", // Yellow
          "rgba(75, 192, 192, 0.8)", // Green
          "rgba(153, 102, 255, 0.8)", // Purple
          "rgba(255, 159, 64, 0.8)", // Orange
          "rgba(199, 199, 199, 0.8)", // Gray
        ];

        const backgroundColors = sortedLabels.map(
          (_, i) => colors[i % colors.length]
        );

        chartInstanceRef.current = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: sortedLabels,
            datasets: [
              {
                data: sortedValues,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map((color) =>
                  color.replace(", 0.8)", ", 1)")
                ),
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "bottom",
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const value = context.parsed;
                    const total = context.dataset.data.reduce(
                      (a, b) => a + b,
                      0
                    );
                    const percentage = Math.round((value / total) * 100);
                    return `${context.label}: ${value} (${percentage}%)`;
                  },
                },
              },
              title: {
                display: true,
                text: title,
                font: {
                  size: 16,
                },
              },
            },
          },
        });
      }

      // Create device chart with demo data
      if (activeTab === "devices") {
        createChart(
          deviceChartRef,
          deviceChartInstance,
          demoData.deviceData,
          "Device Types"
        );
      }

      // Create browser chart with demo data
      if (activeTab === "browsers") {
        createChart(
          browserChartRef,
          browserChartInstance,
          demoData.browserData,
          "Browser Types"
        );
      }

      return () => {
        if (deviceChartInstance.current) {
          deviceChartInstance.current.destroy();
        }
        if (browserChartInstance.current) {
          browserChartInstance.current.destroy();
        }
      };
    }

    // Function to detect device type from user agent
    function getDeviceType(userAgent) {
      if (!userAgent) return "Unknown";

      if (/mobile/i.test(userAgent) && !/tablet/i.test(userAgent)) {
        return "Mobile";
      } else if (/tablet|ipad/i.test(userAgent)) {
        return "Tablet";
      } else if (/windows|macintosh|linux/i.test(userAgent)) {
        return "Desktop";
      } else {
        return "Other";
      }
    }

    // Function to detect browser type
    function getBrowserType(userAgent) {
      if (!userAgent) return "Unknown";

      if (/chrome/i.test(userAgent) && !/chromium|edg/i.test(userAgent)) {
        return "Chrome";
      } else if (/firefox/i.test(userAgent)) {
        return "Firefox";
      } else if (
        /safari/i.test(userAgent) &&
        !/chrome|chromium/i.test(userAgent)
      ) {
        return "Safari";
      } else if (/edg/i.test(userAgent)) {
        return "Edge";
      } else if (/msie|trident/i.test(userAgent)) {
        return "Internet Explorer";
      } else if (/opera|opr/i.test(userAgent)) {
        return "Opera";
      } else if (/brave/i.test(userAgent)) {
        return "Brave";
      } else {
        return "Other";
      }
    }

    // Function to detect operating system
    function getOS(userAgent) {
      if (!userAgent) return "Unknown";

      if (/windows/i.test(userAgent)) {
        return "Windows";
      } else if (/macintosh|mac os x/i.test(userAgent)) {
        return "macOS";
      } else if (/android/i.test(userAgent)) {
        return "Android";
      } else if (/ios|iphone|ipad|ipod/i.test(userAgent)) {
        return "iOS";
      } else if (/linux/i.test(userAgent)) {
        return "Linux";
      } else {
        return "Other";
      }
    }

    // Count device types
    const deviceCounts = {};
    const osCounts = {};
    visitors.forEach((visitor) => {
      // Count device types
      const deviceType = getDeviceType(visitor.userAgent);
      deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;

      // Count operating systems
      const osType = getOS(visitor.userAgent);
      osCounts[osType] = (osCounts[osType] || 0) + 1;
    });

    // Count browser types separately
    const browserCounts = {};
    visitors.forEach((visitor) => {
      const browserType = getBrowserType(visitor.userAgent);
      browserCounts[browserType] = (browserCounts[browserType] || 0) + 1;
    });

    // Helper function to create chart
    function createChart(canvasRef, chartInstanceRef, data, title) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext("2d");

      // Sort data by count descending
      const labels = Object.keys(data);
      const values = Object.values(data);
      const sortedIndices = values
        .map((_, i) => i)
        .sort((a, b) => values[b] - values[a]);

      const sortedLabels = sortedIndices.map((i) => labels[i]);
      const sortedValues = sortedIndices.map((i) => values[i]);

      // Use hardcoded colors
      const colors = [
        "rgba(251, 117, 204, 0.8)", // Brand color - #FB75CC
        "rgba(135, 206, 235, 0.8)", // SkyBlue #87CEEB
        "rgba(255, 99, 132, 0.8)", // Red
        "rgba(255, 206, 86, 0.8)", // Yellow
        "rgba(75, 192, 192, 0.8)", // Green
        "rgba(153, 102, 255, 0.8)", // Purple
        "rgba(255, 159, 64, 0.8)", // Orange
        "rgba(199, 199, 199, 0.8)", // Gray
      ];

      const backgroundColors = sortedLabels.map(
        (_, i) => colors[i % colors.length]
      );

      chartInstanceRef.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: sortedLabels,
          datasets: [
            {
              data: sortedValues,
              backgroundColor: backgroundColors,
              borderColor: backgroundColors.map((color) =>
                color.replace(", 0.8)", ", 1)")
              ),
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${context.label}: ${value} (${percentage}%)`;
                },
              },
            },
            title: {
              display: true,
              text: title,
              font: {
                size: 16,
              },
            },
          },
        },
      });
    }

    // Create device and OS chart
    if (activeTab === "devices") {
      createChart(
        deviceChartRef,
        deviceChartInstance,
        deviceCounts,
        "Device Types"
      );
    }

    // Create browser chart
    if (activeTab === "browsers") {
      createChart(
        browserChartRef,
        browserChartInstance,
        browserCounts,
        "Browser Types"
      );
    }

    // Clean up
    return () => {
      if (deviceChartInstance.current) {
        deviceChartInstance.current.destroy();
      }
      if (browserChartInstance.current) {
        browserChartInstance.current.destroy();
      }
    };
  }, [visitors, activeTab, isDemoMode]);

  if ((!visitors || visitors.length === 0) && !isDemoMode) {
    return (
      <div className="text-center p-4">
        <h2 className="text-xl font-semibold mb-4">{t("deviceAnalytics")}</h2>
        {t("noDeviceData")}
      </div>
    );
  }

  const skyBlue = "#87CEEB";

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">{t("deviceAnalytics")}</h2>
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setActiveTab("devices")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "devices"
                ? `text-white`
                : "bg-background text-foreground hover:bg-accent"
            } border border-gray-200 rounded-l-lg`}
            style={{
              backgroundColor: activeTab === "devices" ? skyBlue : "",
            }}
          >
            {t("devices")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("browsers")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "browsers"
                ? `text-white`
                : "bg-background text-foreground hover:bg-accent"
            } border border-gray-200 rounded-r-lg border-l-0`}
            style={{
              backgroundColor: activeTab === "browsers" ? skyBlue : "",
            }}
          >
            {t("browsers")}
          </button>
        </div>
      </div>

      <div className="relative h-64">
        <div
          className={`flex justify-center absolute inset-0 transition-opacity duration-300 ${
            activeTab === "devices"
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <canvas ref={deviceChartRef}></canvas>
        </div>
        <div
          className={`flex justify-center absolute inset-0 transition-opacity duration-300 ${
            activeTab === "browsers"
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <canvas ref={browserChartRef}></canvas>
        </div>
      </div>
    </div>
  );
}
