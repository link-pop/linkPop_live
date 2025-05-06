"use client";

import { FileDown } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

// ! code start exportChartData function
export function exportChartData(chart, title, timeRangeLabel) {
  if (!chart || typeof window === "undefined") return;

  // Get the chart data
  const labels = chart.data.labels;
  const datasets = chart.data.datasets;

  // Create an array to hold the data for Excel
  const excelData = [];

  // Add header row with period labels
  const headerRow = ["Item"];
  labels.forEach((label) => headerRow.push(label));
  headerRow.push("Total"); // Add total column
  excelData.push(headerRow);

  // Add data rows for each dataset
  datasets.forEach((dataset, index) => {
    // Skip hidden datasets
    const meta = chart.getDatasetMeta(index);
    if (meta.hidden) return;

    const dataRow = [dataset.label];
    let total = 0;

    dataset.data.forEach((value) => {
      dataRow.push(value);
      total += value || 0;
    });

    // Add total at the end
    dataRow.push(total);
    excelData.push(dataRow);
  });

  // Function to escape CSV fields properly
  const escapeCSV = (field) => {
    // If the field contains quotes, commas, or newlines, it needs to be quoted
    const needsQuotes = /[",\n\r]/.test(field);
    if (needsQuotes) {
      // Replace quotes with double quotes and wrap the field in quotes
      return `"${String(field).replace(/"/g, '""')}"`;
    }
    return String(field);
  };

  // Convert the data to properly escaped CSV format
  const csvContent = excelData
    .map((row) => row.map((cell) => escapeCSV(cell)).join(","))
    .join("\n");

  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Create a download link using the Blob
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${title}_${timeRangeLabel}_visitors.csv`);
  document.body.appendChild(link);

  // Trigger download
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
// ? code end exportChartData function

// ! code start ExportButton component
export function ExportButton({ chartInstance, title, timeRangeLabel }) {
  const { t } = useTranslation();

  const handleExport = () => {
    if (chartInstance?.current) {
      exportChartData(chartInstance.current, title, timeRangeLabel);
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center px-3 py-1.5 md:px-4 md:py-2 border rounded-md bg-primary text-xs md:text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-200 shadow-sm"
      title={t("export")}
    >
      <FileDown size={14} className="mr-1.5" />
      {t("export")}
    </button>
  );
}
// ? code end ExportButton component
