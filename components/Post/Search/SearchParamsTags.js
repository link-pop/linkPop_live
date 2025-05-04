"use client";

import { usePathname, useRouter } from "next/navigation";
import { X, ArrowUp, ArrowDown } from "lucide-react";
import { skipUrlSearchParams } from "@/lib/utils/mongo/_settingsSkipUrlSearchParams";
import { useGenerateSortableFields } from "@/hooks/useGenerateSortableFields";
import SortToggle from "./SortToggle";

export default function SearchParamsTags({
  col,
  searchParams,
  allFieldNamesAndTypesInCol,
}) {
  const pathname = usePathname();
  const router = useRouter();

  const sortableFields = useGenerateSortableFields(
    col,
    allFieldNamesAndTypesInCol
  );

  // make human-readable labels for sort parameters - create a map of sort values to their labels
  const sortLabels = {};
  sortableFields.forEach((field) => {
    sortLabels[`${field.value}:1`] = field.labelAsc;
    sortLabels[`${field.value}:-1`] = field.labelDesc;
  });

  // Filter out empty search params and non-search related params
  const activeSearchParams = Object.entries(searchParams || {}).filter(
    // ! skipUrlSearchParams
    ([key, value]) =>
      value &&
      !skipUrlSearchParams(col).includes(key) &&
      // * don't render "liked" and "viewed" tags (they have diff view & logic)
      !(key === "liked") &&
      !(key === "viewed")
  );

  if (activeSearchParams.length === 0) return null;

  return (
    <div className="fcc g10">
      {activeSearchParams.map(([key, value]) => {
        // Create new URLSearchParams without this tag
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete(key);

        // Clear from localStorage if it's a date parameter
        const handleRemoveTag = () => {
          if (
            value.includes("-") &&
            (!isNaN(value.split("-")[0]) || value.split("-")[0] === "0")
          ) {
            const storedParams = JSON.parse(
              localStorage.getItem("searchParams") || "{}"
            );
            delete storedParams[key];
            localStorage.setItem("searchParams", JSON.stringify(storedParams));
          }
          router.push(`${pathname}?${newSearchParams.toString()}`);
        };

        // Get display value - if it's a sort parameter, use the label
        let displayValue = key === "sort" ? sortLabels[value] || value : value;

        // ! sort tags have diff design
        if (key === "sort") {
          const sortValues = value.split(",");
          return sortValues.map((sortValue, index) => (
            <SortToggle
              key={`${key}-${index}`}
              icon={sortValue.endsWith(":-1") ? ArrowDown : ArrowUp}
              text={sortLabels[sortValue] || sortValue}
              hasFilter={true}
              onClick={() => {
                const [field, direction] = sortValue.split(":");
                const newDirection = direction === "-1" ? "1" : "-1";
                const newSortValues = [...sortValues];
                newSortValues[index] = `${field}:${newDirection}`;
                newSearchParams.set(key, newSortValues.join(","));
                router.push(`${pathname}?${newSearchParams.toString()}`);
              }}
              onDeleteFilter={() => {
                const newSortValues = sortValues.filter((_, i) => i !== index);
                if (newSortValues.length === 0) {
                  newSearchParams.delete(key);
                } else {
                  newSearchParams.set(key, newSortValues.join(","));
                }
                router.push(`${pathname}?${newSearchParams.toString()}`);
              }}
              className="!opacity-100"
            />
          ));
        }
        // ? sort tags have diff design

        // ! Function to format timestamp
        const formatTimestamp = (timestamp) => {
          // Return "any date" for timestamp 0
          if (timestamp === "0") return "any date";

          try {
            const date = new Date(parseInt(timestamp));
            if (date.toString() !== "Invalid Date") {
              return date.toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              });
            }
          } catch (e) {
            console.error("Failed to parse timestamp:", e);
          }
          return timestamp;
        };

        // Check if the value is a date range (contains hyphen)
        if (typeof value === "string" && value.includes("-")) {
          const [start, end] = value.split("-");
          if (
            ((!isNaN(start) && start.length >= 13) || start === "0") &&
            ((!isNaN(end) && end.length >= 13) || end === "0")
          ) {
            displayValue = `${formatTimestamp(start)} - ${formatTimestamp(
              end
            )}`;
          }
        }
        // Check if single timestamp
        else if (!isNaN(value) && value.length >= 13) {
          displayValue = formatTimestamp(value);
        }
        // ? Function to format timestamp

        return (
          <div
            key={key}
            className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
          >
            <span>
              {key.replace(/_/g, " ")}: {displayValue}
            </span>
            <button onClick={handleRemoveTag} className="hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
