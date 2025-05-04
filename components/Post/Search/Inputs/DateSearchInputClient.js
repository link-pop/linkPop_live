"use client";

import { usePathname, useRouter } from "next/navigation";
import { SmartDatetimeInput } from "@/components/ui/shared/SmartDatetimeInput/SmartDatetimeInput";
import { useEffect, useState } from "react";
import ClearPostsSearchInputIcon from "../ClearPostsSearchInputIcon";
import { ArrowDownUp } from "lucide-react";

// ! only works with localStorage; hooks like useSearchParams are breaking this comp
export default function DateSearchInputClient({
  col,
  nameInSearchParams,
  searchParams,
  minDate,
  maxDate,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [localSearchParams, setLocalSearchParams] = useState(searchParams);

  // Initialize localStorage on component mount
  useEffect(() => {
    const storedParams = localStorage.getItem("searchParams");
    if (!storedParams) {
      localStorage.setItem("searchParams", JSON.stringify(searchParams));
    }
    setLocalSearchParams(
      JSON.parse(localStorage.getItem("searchParams")) || searchParams
    );
  }, [searchParams]);

  const handleDateChange = (value, type) => {
    // Get current range values from localStorage or use default [0,0]
    const currentParams =
      JSON.parse(localStorage.getItem("searchParams")) || {};
    const [currentMin, currentMax] = currentParams[nameInSearchParams]
      ?.split("-")
      .map(Number) || [0, 0];

    // Determine new values based on which input changed
    const timestamp = value ? Math.floor(new Date(value).getTime()) : 0;
    const newMin = type === "min" ? timestamp : currentMin;
    const newMax = type === "max" ? timestamp : currentMax;

    // Update localStorage
    const newParams = { ...currentParams };
    if (newMin === 0 && newMax === 0) {
      delete newParams[nameInSearchParams];
    } else {
      newParams[nameInSearchParams] = `${newMin}-${newMax}`;
    }

    localStorage.setItem("searchParams", JSON.stringify(newParams));
    setLocalSearchParams(newParams);

    // Get current URL search params and merge with new params
    const currentSearchParams = new URLSearchParams(window.location.search);
    const params = new URLSearchParams(currentSearchParams);

    // Update only the date range parameter
    if (newMin === 0 && newMax === 0) {
      params.delete(nameInSearchParams);
    } else {
      params.set(nameInSearchParams, `${newMin}-${newMax}`);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearState = () => {
    // Clear from localStorage and local state
    const newParams = { ...localSearchParams };
    delete newParams[nameInSearchParams];
    localStorage.setItem("searchParams", JSON.stringify(newParams));
    setLocalSearchParams(newParams);

    // Update URL params directly instead of calling handleDateChange twice
    const currentSearchParams = new URLSearchParams(window.location.search);
    const params = new URLSearchParams(currentSearchParams);
    params.delete(nameInSearchParams);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Parse the range from localStorage
  const [minValue, maxValue] = localSearchParams[nameInSearchParams]
    ? localSearchParams[nameInSearchParams]
        .split("-")
        .map((timestamp) =>
          timestamp !== "0" ? new Date(parseInt(timestamp)) : null
        )
    : [null, null];

  return (
    <div className="fcc mt15">
      <div className="fc gap6 aic">
        <SmartDatetimeInput
          value={minValue}
          onValueChange={(value) => handleDateChange(value, "min")}
          defaultValue={minDate ? new Date(minDate) : null}
          minDate={minDate ? new Date(minDate) : null}
          maxDate={maxDate ? new Date(maxDate) : null}
          label={`${nameInSearchParams} from`}
          labelClassName="bg-white"
        />
        <ArrowDownUp className="w18 h18 gray" />
        <SmartDatetimeInput
          value={maxValue}
          onValueChange={(value) => handleDateChange(value, "max")}
          defaultValue={maxDate ? new Date(maxDate) : null}
          minDate={minDate ? new Date(minDate) : null}
          maxDate={maxDate ? new Date(maxDate) : null}
          label={`${nameInSearchParams} to`}
          labelClassName="bg-white"
        />
      </div>
      <ClearPostsSearchInputIcon
        searchParams={searchParams}
        nameInSearchParams={nameInSearchParams}
        handleClearState={handleClearState}
        col={col}
      />
    </div>
  );
}
